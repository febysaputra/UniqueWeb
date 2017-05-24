package lapak

import (
    "encoding/json"
    "log"
    "time"
    "net/http"
    "strconv"

    "goji.io"
    "goji.io/pat"
    "gopkg.in/mgo.v2"
    "gopkg.in/mgo.v2/bson"
    "../../jsonhandler"
    "../../auth"
    "../../upload"
)

type Lapak struct {
    IdLapak  		         string     `json:"idlapak"`
    UsernamePenjual      string 		`json:"usernamepenjual"`
    NamaBarang		         string   	`json:"namabarang"`
    Tanggal			         time.Time	`json:"tanggal"`
    SpesifikasiBarang		 string		  `json:"spesifikasibarang"`
    Foto			           []string	  `json:"foto"`
    StatusLapak	         string		  `json:"statuslapak"`
    Kategori             string     `json:"kategori"`
    Sertifikat           string        `json:"sertifikat"`
    Kondisi             string          `json:"kondisi"`
    Berat               int             `json:"berat"`
    Waktu	            	 time.Time 	`json:"waktu"`
    HargaSementara       int        `json:"hargasementara"`
    HargaLimit           int        `json:"hargalimit"`
    BatasPenawaran       int        `json:"bataspenawaran"`
    UsernamePemenang     string     `json:"usernamepemenang"`
}

func RoutesLapak(mux *goji.Mux, session *mgo.Session) {

    mux.HandleFunc(pat.Get("/lapak"), allLapak(session))
    mux.HandleFunc(pat.Post("/mylapak/newlapak"), auth.Validate(addLapak(session)))
    mux.HandleFunc(pat.Get("/lapak/:idlapak"), getLapak(session)) // buat retrieve lapak yang dipilih
    mux.HandleFunc(pat.Put("/mylapak/editlapak/:idlapak"), auth.Validate(updateLapak(session)))
    mux.HandleFunc(pat.Delete("/mylapak/deletelapak/:idlapak"), auth.Validate(deleteLapak(session)))
    mux.HandleFunc(pat.Put("/lapak/:idlapak"), auth.Validate(validasilapak(session)))
    mux.HandleFunc(pat.Put("/startlapak/:idlapak"), auth.Validate(startlapak(session)))
}

func EnsureLapak(s *mgo.Session) {
    session := s.Copy()
    defer session.Close()

    c := session.DB("unique").C("lapak")

    index := mgo.Index{
        Key:        []string{"idlapak"},
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


func allLapak(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        session := s.Copy()
        defer session.Close()

        c := session.DB("unique").C("lapak")

        var lapaks []Lapak
        err := c.Find(bson.M{}).Sort("-tanggal").Limit(4).All(&lapaks)
        if err != nil {
            jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
            log.Println("Failed get all lapak: ", err)
            return
        }

        respBody, err := json.MarshalIndent(lapaks, "", "  ")
        if err != nil {
            log.Fatal(err)
        }

        jsonhandler.ResponseWithJSON(w, respBody, http.StatusOK)
    }
}

func addLapak(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        claims, ok := r.Context().Value(auth.MyKey).(auth.Claims)
        if !ok {
            http.NotFound(w, r)
            return
        }

        session := s.Copy()
        defer session.Close()

        var lapak Lapak

        c := session.DB("unique").C("lapak")

        //untuk auto increment
        var lastLapak Lapak
        var lastId  int

        err := c.Find(nil).Sort("-$natural").Limit(1).One(&lastLapak)
        if err != nil {
            lastId = 0
        } else {
            lastId,err = strconv.Atoi(lastLapak.IdLapak)
        }
        currentId := lastId + 1
        lapak.IdLapak = strconv.Itoa(currentId)
        lapak.UsernamePenjual = claims.Username
        lapak.NamaBarang = r.FormValue("namabarang")
        lapak.Tanggal = time.Now()
        lapak.SpesifikasiBarang = r.FormValue("spesifikasibarang")       
        lapak.StatusLapak  = "Menunggu Konfirmasi"
        lapak.Kategori = r.FormValue("kategori")            
        lapak.Sertifikat  = r.FormValue("sertifikat")
        lapak.Kondisi = r.FormValue("kondisi")
        lapak.Berat,_  = strconv.Atoi(r.FormValue("berat"))    
        lapak.HargaSementara,_ = strconv.Atoi(r.FormValue("hargasementara"))
        lapak.HargaLimit,_ = strconv.Atoi(r.FormValue("hargalimit"))
        lapak.BatasPenawaran,_ = strconv.Atoi(r.FormValue("bataspenawaran"))      

        //

        msg := upload.UploadHandler(r,lapak.IdLapak,"lapak")
        if msg["filename"].([]string) != nil{
          lapak.Foto = msg["filename"].([]string)
        }else{
          jsonhandler.ErrorWithJSON(w, msg["message"].(string), http.StatusBadRequest)
          return
        }

        err = c.Insert(lapak)
        if err != nil {
            if mgo.IsDup(err) {
                jsonhandler.ErrorWithJSON(w, "lapak with this IdLapak already exists", http.StatusBadRequest)
                return
            }

            jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
            log.Println("Failed insert lapak: ", err)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        w.Header().Set("Location", r.URL.Path+"/"+lapak.IdLapak)
        w.WriteHeader(http.StatusCreated)
    }
}

func getLapak(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        session := s.Copy()
        defer session.Close()

        IdLapak := pat.Param(r, "idlapak")

        c := session.DB("unique").C("lapak")

        var lapak Lapak
        err := c.Find(bson.M{"idlapak": IdLapak}).One(&lapak)
        if err != nil {
            jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
            log.Println("Failed find lapak: ", err)
            return
        }

        respBody, err := json.MarshalIndent(Lapak{IdLapak:lapak.IdLapak,UsernamePenjual:lapak.UsernamePenjual,NamaBarang:lapak.NamaBarang,Tanggal:lapak.Tanggal,SpesifikasiBarang:lapak.SpesifikasiBarang,
                                                  Foto:lapak.Foto,StatusLapak:lapak.StatusLapak,Kategori:lapak.Kategori,
                                                  Sertifikat:lapak.Sertifikat,Kondisi:lapak.Kondisi,Berat:lapak.Berat,Waktu:lapak.Waktu,HargaSementara:lapak.HargaSementara,BatasPenawaran:lapak.BatasPenawaran,
                                                  UsernamePemenang:lapak.UsernamePemenang}, "", "  ")
        if err != nil {
            log.Fatal(err)
        }

        jsonhandler.ResponseWithJSON(w, respBody, http.StatusOK)
    }
}

func updateLapak(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        claims, ok := r.Context().Value(auth.MyKey).(auth.Claims)
        if !ok {
          http.NotFound(w, r)
          return
        }
        session := s.Copy()
        defer session.Close()

        IdLapak := pat.Param(r, "idlapak")

        var lapak Lapak
        var varmap map[string]interface{}
        in := []byte(`{}`)
        json.Unmarshal(in, &varmap)

        var check struct{ UsernamePenjual     string       `json:"usernamepenjual"` }

        c := session.DB("unique").C("lapak")

        c.Find(bson.M{"idlapak": IdLapak}).Select(bson.M{"usernamepenjual" : 1}).One(&check)

        if check.UsernamePenjual != claims.Username{
          jsonhandler.ErrorWithJSON(w, "you don't have permission", http.StatusNotFound)
          return
        }else{
          msg := upload.UploadHandler(r,IdLapak,"lapak")
          if msg["filename"] != nil {
            varmap["foto"] = msg["filename"].([]string)
          }
          lapak.NamaBarang = r.FormValue("namabarang")
          if lapak.NamaBarang != "" { varmap["namabarang"] = lapak.NamaBarang }
          lapak.SpesifikasiBarang = r.FormValue("spefikasibarang")
          if lapak.SpesifikasiBarang != "" { varmap["spefikasibarang"] = lapak.SpesifikasiBarang }
          lapak.Kategori = r.FormValue("kategori")
          if lapak.Kategori != ""{ varmap["kategori"] = lapak.Kategori }
          lapak.Sertifikat = r.FormValue("sertifikat")
          if lapak.Sertifikat != ""{ varmap["sertifikat"] = lapak.Sertifikat }
          lapak.HargaSementara,_ = strconv.Atoi(r.FormValue("hargasementara"))
          if lapak.HargaSementara != 0{ varmap["hargasementara"] = lapak.HargaSementara }
          lapak.HargaLimit,_ = strconv.Atoi(r.FormValue("hargalimit"))
          if lapak.HargaLimit != 0{ varmap["hargalimit"] = lapak.HargaLimit }
          lapak.BatasPenawaran,_ = strconv.Atoi(r.FormValue("bataspenawaran"))
          if lapak.BatasPenawaran != 0{ varmap["bataspenawaran"] = lapak.BatasPenawaran }

          err := c.Update(bson.M{"idlapak": IdLapak},bson.M{"$set": varmap})
          if err != nil {
              switch err {
              default:
                  jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
                  log.Println("Failed update lapak: ", err)
                  return
              case mgo.ErrNotFound:
                  jsonhandler.ErrorWithJSON(w, "lapak not found", http.StatusNotFound)
                  return
              }
        }
        w.WriteHeader(http.StatusNoContent)
    }
  }
}

func deleteLapak(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        session := s.Copy()
        defer session.Close()

        IdLapak := pat.Param(r, "idlapak")

        c := session.DB("unique").C("lapak")

        err := c.Remove(bson.M{"idlapak": IdLapak})
        if err != nil {
            switch err {
            default:
                jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
                log.Println("Failed delete lapak: ", err)
                return
            case mgo.ErrNotFound:
                jsonhandler.ErrorWithJSON(w, "lapak not found", http.StatusNotFound)
                return
            }
        }

        w.WriteHeader(http.StatusNoContent)
    }
}

func validasilapak(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
      claims, ok := r.Context().Value(auth.MyKey).(auth.Claims)
      if !ok {
        http.NotFound(w, r)
        return
      }
      if claims.Class == "admin"{
        session := s.Copy()
        defer session.Close()

        IdLapak := pat.Param(r, "idlapak")

        c := session.DB("unique").C("lapak")
        c.Update(bson.M{"idlapak": IdLapak}, bson.M{"$set": bson.M{"statuslapak": "Diizinkan"}})

        w.WriteHeader(http.StatusNoContent)
      } else{
        jsonhandler.ErrorWithJSON(w, "you don't have permission", http.StatusNotFound)
        return
      }
    }
}

func startlapak(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
      claims, ok := r.Context().Value(auth.MyKey).(auth.Claims)
      if !ok {
        http.NotFound(w, r)
        return
      }

      session := s.Copy()
      defer session.Close()

      IdLapak := pat.Param(r, "idlapak")
      c:= session.DB("unique").C("lapak")
      var check struct{ UsernamePenjual     string     `json:"usernamepenjual"` }
      c.Find(bson.M{"idlapak": IdLapak}).Select(bson.M{"usernamepenjual" : 1}).One(&check)
      if claims.Username == check.UsernamePenjual{
        r.ParseMultipartForm(500000)
        waktuakhir,_ := time.Parse("2006-01-02 15:04 MST",r.FormValue("waktu"))
        selangwaktu := time.Until(waktuakhir)
        log.Println(time.Now(),selangwaktu)
        c.Update(bson.M{"idlapak": IdLapak}, bson.M{"$set": bson.M{"waktu": waktuakhir}})
      }else{
        jsonhandler.ErrorWithJSON(w, "you don't have permission", http.StatusNotFound)
        return
      }
    }
}