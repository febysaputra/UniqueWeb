package users

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "crypto/sha256"
    "time"

    "goji.io"
    "goji.io/pat"
    "gopkg.in/mgo.v2"
    "gopkg.in/mgo.v2/bson"
    "../../auth"
    "../../jsonhandler"
    "../lapak"
    "../../upload"

)

type User struct {
    Username      string    `json:"username"`
    Password      string    `json:"password"`
    Email         string    `json:"email"`
    Class         string    `json:"class"`
    Nama          string    `json:"nama"`
    Alamat        string    `json:"alamat"`
    NoTelp        string    `json:"notelp"`
    JenisKelamin  string    `json:"jeniskelamin"`
    TiketLelang   int       `json:"tiketlelang"`
    FotoProfile   string    `json:"fotoprofile"`

    //verified user
    NamaBank          string    `json:"namabank"`
    NoRekening        string    `json:"norekening"`
    AtasNamaRekening  string    `json:"atasnamarekening"`
    NoKTP             string    `json:"noktp"`
    NamaKTP           string    `json:"namaktp"`
    StatusUser        string    `json:"statususer"`
    Foto              []string  `json:"foto"` //1. foto rekening 2.foto ktp
}

type DataSend struct{
  User   User `json:"user"`
  Lelang []lapak.Lapak `json:"lelang"`
}

func RoutesUser(mux *goji.Mux, session *mgo.Session) {

    mux.HandleFunc(pat.Get("/users"), allUsers(session)) //ini gakepake
    mux.HandleFunc(pat.Post("/register"), register(session)) //ini register
    mux.HandleFunc(pat.Get("/profile/:username"), getUser(session)) // ini buat liat profile
    mux.HandleFunc(pat.Put("/profile/editprofile/:type"), auth.Validate(updateUser(session)))
    mux.HandleFunc(pat.Delete("/profile/deleteaccount/:username"), auth.Validate(deleteUser(session)))
    mux.HandleFunc(pat.Post("/login"), login(session)) // login
    mux.HandleFunc(pat.Get("/checkexpiredtoken"), auth.CheckExpiredToken(session))
    mux.HandleFunc(pat.Post("/logout"), auth.Validate(logout(session))) // Logout
    mux.HandleFunc(pat.Get("/admin"), auth.Validate(admin)) //Admin
    mux.HandleFunc(pat.Post("/verifieduser"), auth.Validate(ValidateUser(session)))
    mux.HandleFunc(pat.Get("/checkstatususer"), auth.Validate(CheckStatusUser(session)))
}

func EnsureUser(s *mgo.Session) {
    session := s.Copy()
    defer session.Close()

    c := session.DB("unique").C("users")

    index := mgo.Index{
        Key:        []string{"username"},
        Unique:     true,
        DropDups:   true,
        Background: true,
        Sparse:     true,
    }

    err := c.EnsureIndex(index)
    if err != nil {
        panic(err)
    }
}

func allUsers(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        session := s.Copy()
        defer session.Close()

        c := session.DB("unique").C("users")

        var users []User
        err := c.Find(bson.M{}).All(&users)
        if err != nil {
            jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
            log.Println("Failed get all users: ", err)
            return
        }

        respBody, err := json.MarshalIndent(users, "", "  ")
        if err != nil {
            log.Fatal(err)
        }

        jsonhandler.ResponseWithJSON(w, respBody, http.StatusOK)
    }
}

func register(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        session := s.Copy()
        defer session.Close()

        var user User
        decoder := json.NewDecoder(r.Body)
        err := decoder.Decode(&user)
        if err != nil {
            jsonhandler.ErrorWithJSON(w, "Incorrect body", http.StatusBadRequest)
            return
        }

        c := session.DB("unique").C("users")

        passEncrypt := sha256.Sum256([]byte(user.Password))
        user.Password = fmt.Sprintf("%x", passEncrypt)

        err = c.Insert(user)
        if err != nil {
            if mgo.IsDup(err) {
                jsonhandler.ErrorWithJSON(w, "duplicate", http.StatusOK)
                return
            }

            jsonhandler.ErrorWithJSON(w, "Database error", http.StatusNotFound)
            log.Println("Failed insert user: ", err)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        w.Header().Set("Location", r.URL.Path+"/"+user.Username)
        w.WriteHeader(http.StatusCreated)
    }
}


func getUser(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
  return func(w http.ResponseWriter, r *http.Request) {
    session := s.Copy()
    defer session.Close()

    username := pat.Param(r, "username")

    c := session.DB("unique").C("users")
    d := session.DB("unique").C("lapak")

    var user User
    var lelang []lapak.Lapak

    err := c.Find(bson.M{"username": username}).One(&user)
    if err != nil {
      jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
      log.Println("Failed find user: ", err)
      return
    }

    if user.Username == "" {
      jsonhandler.ErrorWithJSON(w, "user not found", http.StatusNotFound)
      return
    }

    err = d.Find(bson.M{"usernamepenjual": username}).All(&lelang)

    cookie, err := r.Cookie("Auth")
    if err == nil {
      claims :=auth.CheckToken(cookie.Value,w,r)
      if username==claims["username"].(string){
        respBody, err := json.MarshalIndent(DataSend{User:user,Lelang:lelang}, "", "  ")
        if err != nil {
          log.Fatal(err)
        }
        jsonhandler.ResponseWithJSON(w, respBody, http.StatusOK)
        return
      }
    }
    respBody, err := json.MarshalIndent(DataSend{User:User{Username:user.Username,Nama:user.Nama,Alamat:user.Alamat,NoTelp:user.NoTelp,JenisKelamin:user.JenisKelamin,TiketLelang:user.TiketLelang},
                      Lelang:lelang}, "", "  ")
    if err != nil {
      log.Fatal(err)
    }
    jsonhandler.ResponseWithJSON(w, respBody, http.StatusOK)
    return
  }
}

func login(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        session := s.Copy()
        defer session.Close()

        var user User
        decoder := json.NewDecoder(r.Body)
        err := decoder.Decode(&user)
        if err != nil {
            jsonhandler.ErrorWithJSON(w, "Incorrect body", http.StatusBadRequest)
            return
        }

        c := session.DB("unique").C("users")

        passEncrypt := sha256.Sum256([]byte(user.Password))
        user.Password = fmt.Sprintf("%x", passEncrypt)

        err = c.Find(bson.M{"username": user.Username,"password": user.Password}).One(&user)
        if err != nil {
        respBody , _ := json.MarshalIndent(jsonhandler.MessageJSON{Status: false, Message: "user not found"}, "", "  ")
            jsonhandler.ResponseWithJSON(w, respBody, http.StatusOK)
            log.Println("Failed find user: ", err)
            return
        } else{
            auth.SetToken(w,r,user.Username,user.Class)
            return
        }
    }
}

func logout(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
  return func(w http.ResponseWriter, r *http.Request) {
    session := s.Copy()
    defer session.Close()


    deleteCookie := http.Cookie{Name: "Auth", Value: "none", Expires: time.Now()}
    http.SetCookie(w, &deleteCookie)
    jsonhandler.SendJSON(w, "logout", http.StatusOK);
    return
  }
}


func updateUser(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        claims, ok := r.Context().Value(auth.MyKey).(auth.Claims)
        if !ok {
          http.NotFound(w, r)
          return
        }
        session := s.Copy()
        defer session.Close()

        tipe := pat.Param(r, "type")

        var user User
        username := claims.Username

        var varmap map[string]interface{}
        in := []byte(`{}`)
        json.Unmarshal(in, &varmap)

        c := session.DB("unique").C("users")

        if tipe == "umum"{ 

          user.Class = "Customer"
          msg := upload.UploadHandler(r,username,"profileuser")
          user.Username = r.FormValue("username")
          user.Nama = r.FormValue("nama")
          user.JenisKelamin = r.FormValue("jeniskelamin")

          if user.Username != "" {
            varmap["username"] = user.Username
          }

          if user.Nama != "" {
            varmap["nama"] = user.Nama
          }

          if user.JenisKelamin != "" {
            varmap["jeniskelamin"] = user.JenisKelamin
          }

          if msg["filename"] != nil {
            varmap["fotoprofile"] = msg["filename"].(string)
          }

          err := c.Update(bson.M{"username": username}, bson.M{"$set": varmap})

          if err != nil{
            jsonhandler.ErrorWithJSON(w, "Gagal mengupdate info user", http.StatusOK)
            return
          }

            if username != user.Username {
              deleteCookie := http.Cookie{Name: "Auth", Value: "none", Expires: time.Now()}
              http.SetCookie(w, &deleteCookie)
              auth.SetToken(w,r,user.Username,user.Class)
              c = session.DB("unique").C("lapak")

              c.Update(bson.M{"usernamepenjual": username}, bson.M{"$set": bson.M{"usernamepenjual": user.Username}})
              c.Update(bson.M{"usernamepemenang": username}, bson.M{"$set": bson.M{"usernamepemenang": user.Username}})

              c = session.DB("unique").C("order")

              c.Update(bson.M{"usernamepenjual": username}, bson.M{"$set": bson.M{"usernamepenjual": user.Username}})
              c.Update(bson.M{"usernamepembeli": username}, bson.M{"$set": bson.M{"usernamepembeli": user.Username}})
            }
          w.WriteHeader(http.StatusNoContent)
        }

        if tipe == "mail" {

            user.Email = r.FormValue("email")
            user.NoTelp = r.FormValue("notelp")

            if user.Email != ""{
              varmap["email"] = user.Email
            }
            if user.NoTelp != ""{
              varmap["notelp"] = user.NoTelp
            }

            err := c.Update(bson.M{"username": username}, bson.M{"$set": varmap})
            if err != nil{
              jsonhandler.ErrorWithJSON(w, "Gagal mengupdate mail user", http.StatusOK)
              return
            }
            w.WriteHeader(http.StatusNoContent)
        }

        if tipe == "password" {

          newpass := r.FormValue("newpass")
          passEncrypt := sha256.Sum256([]byte(newpass))
          user.Password = fmt.Sprintf("%x", passEncrypt)

          if user.Password != ""{
            err := c.Update(bson.M{"username": username}, bson.M{"$set": bson.M{"password": user.Password}})
            if err != nil{
              jsonhandler.ErrorWithJSON(w, "Gagal mengupdate password user", http.StatusOK)
              return
            }
          }
          w.WriteHeader(http.StatusNoContent)
        }
    }
}

func deleteUser(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        session := s.Copy()
        defer session.Close()

        username := pat.Param(r, "username")

        c := session.DB("unique").C("users")

        err := c.Remove(bson.M{"username": username})
        if err != nil {
            switch err {
            default:
                jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
                log.Println("Failed delete user: ", err)
                return
            case mgo.ErrNotFound:
                jsonhandler.ErrorWithJSON(w, "user not found", http.StatusNotFound)
                return
            }
        }

        w.WriteHeader(http.StatusNoContent)
    }
}

func admin(res http.ResponseWriter, req *http.Request) {
  claims, ok := req.Context().Value(auth.MyKey).(auth.Claims)
  if !ok {
    http.NotFound(res, req)
    return
  }
  if claims.Class == "admin"{
     fmt.Fprintf(res, "Hello %s", claims.Username)
  } else{
    http.NotFound(res,req)
    return
  }
}

func ValidateUser(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
  return func(w http.ResponseWriter, r *http.Request) {
      claims, ok := r.Context().Value(auth.MyKey).(auth.Claims)
      if !ok {
        http.NotFound(w, r)
        return
      }
      session := s.Copy()
      defer session.Close()

      c := session.DB("unique").C("users")

      msg := upload.UploadHandler(r,claims.Username,"verifieduser")
      if msg["filename"] == nil{
        jsonhandler.ErrorWithJSON(w, msg["message"].(string), http.StatusBadRequest)
        return
      }

      err := c.Update(bson.M{"username": claims.Username}, bson.M{"$set": bson.M{"namabank": r.FormValue("namabank"),"norekening": r.FormValue("norekening"),
            "atasnamarekening":r.FormValue("atasnamarekening"),"noktp":r.FormValue("noktp") ,"namaktp":r.FormValue("namaktp"), "statususer":"Menunggu konfirmasi" ,"foto": msg["filename"].([]string)}})

      jsonhandler.SendJSON(w, "verifikasi berhasil", http.StatusOK)

      if err != nil{
        jsonhandler.ErrorWithJSON(w, "Gagal mengupdate user", http.StatusBadRequest)
        return
      }
  }
}

func CheckStatusUser(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
  return func(w http.ResponseWriter, r *http.Request) {
      claims, ok := r.Context().Value(auth.MyKey).(auth.Claims)
      if !ok {
        http.NotFound(w, r)
        return
      }
      session := s.Copy()
      defer session.Close()

      var user User

      c := session.DB("unique").C("users")

      err := c.Find(bson.M{"username": claims.Username}).One(&user)
      if err != nil {
        jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
        log.Println("Failed find user: ", err)
        return
      }

      respBody, err := json.MarshalIndent(User{StatusUser: user.StatusUser}, "", "  ")
      if err != nil {
          log.Fatal(err)
      }

      jsonhandler.ResponseWithJSON(w, respBody, http.StatusOK)
  }
}

