package order

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

type Order struct {
    IdOrder             string     `json:"idorder"`
    IdLapak  		        string     `json:"idlapak"`
    UsernamePenjual     string 	   `json:"usernamepenjual"`
    UsernamePembeli     string     `json:"usernamepembeli"`
    NamaPembeli		      string     `json:"namapembeli"`
    NoTelp              string     `json:"notelp"`
    Alamat              string     `json:"alamat"`
    KodePos             int        `json:"kodepos"`
    IdKurir             string     `json:"idkurir"`
    TotalHarga          int        `json:"totalharga"`
    StatusTransaksi    string     `json:"statustransaksi"`
    NoResi              string     `json:"noresi"`
}


func RoutesOrder(mux *goji.Mux, session *mgo.Session) {

    mux.HandleFunc(pat.Get("/order"), allOrder(session))
    mux.HandleFunc(pat.Post("/order"), auth.Validate(addOrder(session)))
    mux.HandleFunc(pat.Get("/order/:idorder"), auth.Validate(getOrder(session)))
    mux.HandleFunc(pat.Delete("/order/:idorder"), auth.Validate(deleteOrder(session)))
    mux.HandleFunc(pat.Put("/order/:idorder"), auth.Validate(konfirmasipembayaran(session)))
    mux.HandleFunc(pat.Put("/mylapak/order/:idorder"), auth.Validate(konfirmasipengiriman(session)))
}

func EnsureOrder(s *mgo.Session) {
    session := s.Copy()
    defer session.Close()

    c := session.DB("unique").C("order")

    index := mgo.Index{
        Key:        []string{"idorder"},
        Unique:     true,
        DropDups:   true,
        Background: true,
        Sparse:     true,
    }
    err := c.EnsureIndex(index)
    if err != nil {
        panic(err)
    }
    c = session.DB("unique").C("lapak")

    index = mgo.Index{
        Key:        []string{"idlapak"},
        Unique:     true,
        DropDups:   true,
        Background: true,
        Sparse:     true,
    }
    err = c.EnsureIndex(index)
    if err != nil {
        panic(err)
    }
}

func allOrder(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        session := s.Copy()
        defer session.Close()

        c := session.DB("unique").C("order")

        var orders []Order
        err := c.Find(bson.M{}).All(&orders)
        if err != nil {
            jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
            log.Println("Failed get all order: ", err)
            return
        }

        respBody, err := json.MarshalIndent(orders, "", "  ")
        if err != nil {
            log.Fatal(err)
        }

        jsonhandler.ResponseWithJSON(w, respBody, http.StatusOK)
    }
}

func addOrder(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        session := s.Copy()
        defer session.Close()

        var order Order
        var harga struct{ HargaSementara int `json:"hargasementara"`}
        decoder := json.NewDecoder(r.Body)
        err := decoder.Decode(&order)
        if err != nil {
            jsonhandler.ErrorWithJSON(w, "Incorrect body", http.StatusBadRequest)
            return
        }

        IdLapak := order.IdLapak
        d := session.DB("unique").C("lapak")
        err = d.Find(bson.M{"idlapak": IdLapak}).Select(bson.M{"hargasementara" : 1}).One(&harga)
        if err != nil {
          jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
          log.Println("Failed insert order: ", err)
          return
        }
        order.TotalHarga = harga.HargaSementara
        rand.Seed(time.Now().Unix())
        order.TotalHarga += rand.Intn(999)

        c := session.DB("unique").C("order")

        //untuk auto increment
        var lastOrder Order
        var lastId  int

        err = c.Find(nil).Sort("-$natural").Limit(1).One(&lastOrder)
        if err != nil {
          lastId = 0
        } else {
          lastId,err = strconv.Atoi(lastOrder.IdOrder)
        }
        currentId := lastId + 1
        order.IdOrder = strconv.Itoa(currentId)


        err = c.Insert(order)

        if err != nil {
          if mgo.IsDup(err) {
              jsonhandler.ErrorWithJSON(w, "order with this IdOrder already exists", http.StatusBadRequest)
              return
          }
          jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
          log.Println("Failed insert order: ", err)
          return
        }

        w.Header().Set("Content-Type", "application/json")
        w.Header().Set("Location", r.URL.Path+"/"+order.IdOrder)
        w.WriteHeader(http.StatusCreated)
    }
}

func getOrder(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        claims, ok := r.Context().Value(auth.MyKey).(auth.Claims)
        if !ok {
          http.NotFound(w, r)
          return
        }
        session := s.Copy()
        defer session.Close()

        IdOrder := pat.Param(r, "idorder")

        c := session.DB("unique").C("order")
        var check struct{ UsernamePembeli string `json:"usernamepembeli"`}
        c.Find(bson.M{"idorder": IdOrder}).Select(bson.M{"usernamepembeli" : 1}).One(&check)
        if check.UsernamePembeli == claims.Username{
          var order Order
          err := c.Find(bson.M{"idorder": IdOrder}).One(&order)
          if err != nil {
              jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
              log.Println("Failed find order: ", err)
              return
          }

          respBody, err := json.MarshalIndent(Order{NamaPembeli:order.NamaPembeli,NoTelp:order.NoTelp,Alamat:order.Alamat,
                                                    KodePos:order.KodePos,TotalHarga:order.TotalHarga,StatusTransaksi:order.StatusTransaksi,NoResi:order.NoResi}, "", "  ")
          if err != nil {
              log.Fatal(err)
          }

          jsonhandler.ResponseWithJSON(w, respBody, http.StatusOK)
      }else{
        jsonhandler.ErrorWithJSON(w, "you don't have permission", http.StatusNotFound)
        return
      }
    }
}

func konfirmasipembayaran(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
      claims, ok := r.Context().Value(auth.MyKey).(auth.Claims)
      if !ok {
        http.NotFound(w, r)
        return
      }
      if claims.Class == "admin"{
        session := s.Copy()
        defer session.Close()

        IdOrder := pat.Param(r, "idorder")

        c := session.DB("unique").C("order")

        c.Update(bson.M{"idorder": IdOrder}, bson.M{"$set": bson.M{"statustransaksi": "Sudah ditransfer"}})

        w.WriteHeader(http.StatusNoContent)
      } else{
        jsonhandler.ErrorWithJSON(w, "you don't have permission", http.StatusNotFound)
        return
      }

    }
}

func deleteOrder(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        session := s.Copy()
        defer session.Close()

        IdOrder := pat.Param(r, "idorder")

        c := session.DB("unique").C("order")

        err := c.Remove(bson.M{"idorder": IdOrder})
        if err != nil {
            switch err {
            default:
                jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
                log.Println("Failed delete order: ", err)
                return
            case mgo.ErrNotFound:
                jsonhandler.ErrorWithJSON(w, "order not found", http.StatusNotFound)
                return
            }
        }

        w.WriteHeader(http.StatusNoContent)
    }
}

func konfirmasipengiriman(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
      claims, ok := r.Context().Value(auth.MyKey).(auth.Claims)
      if !ok {
        http.NotFound(w, r)
        return
      }
      session := s.Copy()
      defer session.Close()

      IdOrder := pat.Param(r, "idorder")

      var Input struct{NoResi string `json:"noresi"`}
      decoder := json.NewDecoder(r.Body)
      err := decoder.Decode(&Input)
      if err != nil {
          jsonhandler.ErrorWithJSON(w, "Incorrect body", http.StatusBadRequest)
          return
      }

      var order struct{ UsernamePenjual     string 	   `json:"usernamepenjual"` }

      c := session.DB("unique").C("order")
      c.Find(bson.M{"idorder": IdOrder}).Select(bson.M{"usernamepenjual" : 1}).One(&order)
      if order.UsernamePenjual != claims.Username{
        jsonhandler.ErrorWithJSON(w, "you don't have permission", http.StatusNotFound)
        return
      } else{
        c.Update(bson.M{"idorder": IdOrder}, bson.M{"$set": bson.M{"statustransaksi": "Sudah dikirim","noresi" : Input.NoResi}})
        w.WriteHeader(http.StatusNoContent)
      }
    }
}
