package tiket

import (
    "encoding/json"
    "log"
    "net/http"
    "math/rand"
    "strconv"
    "time"

    "goji.io"
    "goji.io/pat"
    "gopkg.in/mgo.v2"
    "gopkg.in/mgo.v2/bson"
    "../../jsonhandler"
    "../../auth"
)

type Tiket struct {
    IdTiket            string     `json:"idorder"`
    UsernamePemilik    string     `json:"usernamepemilik"`
    Tanggal            time.Time  `json:"tanggal"`
    Jumlah             int        `json:"jumlah"`
    HargaTotal         int        `json:"hargatotal"`
    FotoBukti          string     `json:"fotobukti"`
    StatusTransaksi    string     `json:"statustransaksi"`
}


func RoutesTiket(mux *goji.Mux, session *mgo.Session) {

    mux.HandleFunc(pat.Get("/tikets"), allTiket(session))
    mux.HandleFunc(pat.Post("/tiket"), auth.Validate(addTiket(session)))
    mux.HandleFunc(pat.Get("/tiket"), auth.Validate(getTiket(session)))
    mux.HandleFunc(pat.Put("/tiket/:idtiket"), auth.Validate(konfirmasipembayaran(session)))
    mux.HandleFunc(pat.Put("/tiket/:idtiket"), auth.Validate(tambahtiket(session)))

}

func EnsureTiket(s *mgo.Session) {
    session := s.Copy()
    defer session.Close()

    c := session.DB("unique").C("tiket")

    index := mgo.Index{
        Key:        []string{"idtiket"},
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

func allTiket(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        session := s.Copy()
        defer session.Close()

        c := session.DB("unique").C("tiket")

        var tikets []Tiket
        err := c.Find(bson.M{}).All(&tikets)
        if err != nil {
            jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
            log.Println("Failed get all tiket: ", err)
            return
        }

        respBody, err := json.MarshalIndent(tikets, "", "  ")
        if err != nil {
            log.Fatal(err)
        }

        jsonhandler.ResponseWithJSON(w, respBody, http.StatusOK)
    }
}

func addTiket(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        session := s.Copy()
        defer session.Close()

        var tiket Tiket
        decoder := json.NewDecoder(r.Body)
        err := decoder.Decode(&tiket)
        if err != nil {
            jsonhandler.ErrorWithJSON(w, "Incorrect body", http.StatusBadRequest)
            return
        }

        tiket.HargaTotal = tiket.Jumlah * 50000
        rand.Seed(time.Now().Unix())
        tiket.HargaTotal += rand.Intn(999)

        c := session.DB("unique").C("tiket")

        //untuk auto increment
        var lastTiket Tiket
        var lastId  int

        err = c.Find(nil).Sort("-$natural").Limit(1).One(&lastTiket)
        if err != nil {
          lastId = 0
        } else {
          lastId,err = strconv.Atoi(lastTiket.IdTiket)
        }
        currentId := lastId + 1
        tiket.IdTiket = strconv.Itoa(currentId)


        err = c.Insert(tiket)

        if err != nil {
          if mgo.IsDup(err) {
              jsonhandler.ErrorWithJSON(w, "tiket with this IdOrder already exists", http.StatusBadRequest)
              return
          }
          jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
          log.Println("Failed insert tiket: ", err)
          return
        }

        w.Header().Set("Content-Type", "application/json")
        w.Header().Set("Location", r.URL.Path+"/"+tiket.IdTiket)
        w.WriteHeader(http.StatusCreated)
    }
}

func getTiket(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        claims, ok := r.Context().Value(auth.MyKey).(auth.Claims)
        if !ok {
          http.NotFound(w, r)
          return
        }
        session := s.Copy()
        defer session.Close()

        var tikets []Tiket
        c := session.DB("unique").C("tiket")
        err := c.Find(bson.M{"usernamepemilik":claims.Username,"statustransaksi":"Belum dibayar"}).Select(bson.M{"usernamepemilik":0,"idtiket":0}).All(&tikets)
        if err != nil {
            jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
            log.Println("Failed get all tiket: ", err)
            return
        }

        respBody, err := json.MarshalIndent(tikets, "", "  ")
        if err != nil {
            log.Fatal(err)
        }
        jsonhandler.ResponseWithJSON(w, respBody, http.StatusOK)
    }
}

func konfirmasipembayaran(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
      claims, ok := r.Context().Value(auth.MyKey).(auth.Claims)
      if !ok {
        http.NotFound(w, r)
        return
      }
      session := s.Copy()
      defer session.Close()

      IdTiket := pat.Param(r, "idtiket")

      var Input struct{FotoBukti string `json:"fotobukti"`}
      decoder := json.NewDecoder(r.Body)
      err := decoder.Decode(&Input)
      if err != nil {
          jsonhandler.ErrorWithJSON(w, "Incorrect body", http.StatusBadRequest)
          return
      }

      var tiket struct{ UsernamePemilik     string 	   `json:"usernamepemilik"` }

      c := session.DB("unique").C("tiket")
      c.Find(bson.M{"idtiket": IdTiket}).Select(bson.M{"usernamepemilik" : 1}).One(&tiket)
      if tiket.UsernamePemilik != claims.Username{
        jsonhandler.ErrorWithJSON(w, "you don't have permission", http.StatusNotFound)
        return
      } else{
        c.Update(bson.M{"idtiket": IdTiket}, bson.M{"$set": bson.M{"foto": Input.FotoBukti}})
        w.WriteHeader(http.StatusNoContent)
      }
    }
}

func tambahtiket(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
      claims, ok := r.Context().Value(auth.MyKey).(auth.Claims)
      if !ok {
        http.NotFound(w, r)
        return
      }
      if claims.Class == "admin"{
        session := s.Copy()
        defer session.Close()

        IdTiket := pat.Param(r, "idtiket")
        var tiket Tiket
        c := session.DB("unique").C("tiket")


        c.Update(bson.M{"idtiket": IdTiket}, bson.M{"$set": bson.M{"statustransaksi": "Sudah ditransfer"}})
        c.Find(bson.M{"idtiket": IdTiket}).One(&tiket)

        d:= session.DB("unique").C("user")
        var check struct {TiketLelang int `json:"tiketlelang"`}
        d.Find(bson.M{"username": tiket.UsernamePemilik}).Select(bson.M{"tiketlelang":1}).All(&check)
        d.Update(bson.M{"username": tiket.UsernamePemilik}, bson.M{"$set": bson.M{"tiketlelang":check.TiketLelang + tiket.Jumlah}})

        w.WriteHeader(http.StatusNoContent)
      } else{
        jsonhandler.ErrorWithJSON(w, "you don't have permission", http.StatusNotFound)
        return
      }

    }
}
