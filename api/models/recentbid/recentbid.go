package recentbid

import (
    "encoding/json"
    "log"
    "net/http"
    "strconv"

    "goji.io"
    "goji.io/pat"
    "gopkg.in/mgo.v2"
    "gopkg.in/mgo.v2/bson"
    "../../jsonhandler"
    "../../auth"
    "../lapak"
)

type RecentBid struct{
	IdBid			string	`json:"idbid"`
	IdLapak 		string	`json:"idlapak"`
	UsernamePembeli	string	`json:"usernamepembeli"` //harus diubah jika username diubah
	HargaTawar		int		`json:"hargatawar"`
}

func RoutesRecentBid(mux *goji.Mux, session *mgo.Session) {

    mux.HandleFunc(pat.Get("/recentbid"), allRecentBid(session))
    mux.HandleFunc(pat.Post("/room/recentbid/:idlapak"), auth.Validate(Bid(session))) //user melakukan bid
    mux.HandleFunc(pat.Delete("room/recentbid/restart/:idlapak"), auth.Validate(restartBid(session))) //untuk pembuka lelang jika tidak ada pemenang yang mengambil barang
}

func EnsureRecentBid(s *mgo.Session) {
    session := s.Copy()
    defer session.Close()

    c := session.DB("unique").C("recentbid")

    index := mgo.Index{
        Key:        []string{"idbid"},
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

func allRecentBid(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        session := s.Copy()
        defer session.Close()

        c := session.DB("unique").C("recentbid")

        var recentbids []RecentBid
        err := c.Find(bson.M{}).All(&recentbids)
        if err != nil {
            jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
            log.Println("Failed get all recent bid: ", err)
            return
        }

        respBody, err := json.MarshalIndent(recentbids, "", "  ")
        if err != nil {
            log.Fatal(err)
        }

        jsonhandler.ResponseWithJSON(w, respBody, http.StatusOK)
    }
}

func Bid(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
    	claims, ok := r.Context().Value(auth.MyKey).(auth.Claims)
	    if !ok {
	       http.NotFound(w, r)
	       return
	    }
        session := s.Copy()
        defer session.Close()

        var recentbid RecentBid
        decoder := json.NewDecoder(r.Body)
        err := decoder.Decode(&recentbid)
        if err != nil {
            jsonhandler.ErrorWithJSON(w, "Incorrect body", http.StatusBadRequest)
            return
        }

        IdLapak := pat.Param(r, "idlapak")

        c := session.DB("unique").C("recentbid")
        e := session.DB("unique").C("lapak")

        hargatawar := recentbid.HargaTawar

        err = c.Find(bson.M{"usernamepembeli": claims.Username, "idlapak": IdLapak}).One(&recentbid)
        if err != nil {

            //untuk auto increment
	        var lastRecentBid RecentBid
	        var lastId  int

	        err = c.Find(nil).Sort("-$natural").Limit(1).One(&lastRecentBid)
	        if err != nil {
	            lastId = 0
	        } else {
	            lastId,err = strconv.Atoi(lastRecentBid.IdBid)
	        }
	        currentId := lastId + 1
	        recentbid.IdBid = strconv.Itoa(currentId)
	        recentbid.IdLapak = IdLapak
	        recentbid.UsernamePembeli = claims.Username
	        //

	        err = c.Insert(recentbid)
	        if err != nil {
	            if mgo.IsDup(err) {
	                jsonhandler.ErrorWithJSON(w, "recentbid with this IdBid already exists", http.StatusBadRequest)
	                return
	            }

	            jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
	            log.Println("Failed insert recentbid: ", err)
	            return
	        }

        } else {
        	err = c.Update(bson.M{"usernamepembeli": claims.Username, "idlapak": IdLapak}, bson.M{"$set": bson.M{"hargatawar": hargatawar}}) //belum usernamepembeli diubah kalo username ganti
	        if err != nil {
	            switch err {
	            default:
	                jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
	                log.Println("Failed update recentbid: ", err)
	                return
	            case mgo.ErrNotFound:
	                jsonhandler.ErrorWithJSON(w, "RecentBid not found", http.StatusNotFound)
	                return
	            }
	        }

        }

        //update hargasementara
        var lapak lapak.Lapak
        err = e.Find(bson.M{"idlapak": IdLapak}).Select(bson.M{"hargasementara" : 1, "bataspenawaran": 1}).One(&lapak)
        if err != nil {
            jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
            log.Println("Failed find lapak: ", err)
            return
        }

        err = e.Update(bson.M{"idlapak": IdLapak}, bson.M{"$set": bson.M{"hargasementara": hargatawar+lapak.HargaSementara, "bataspenawaran": hargatawar+lapak.BatasPenawaran}})
        if err != nil {
            switch err {
            default:
                jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
                log.Println("Failed update hargasementara: ", err)
                return
            case mgo.ErrNotFound:
                jsonhandler.ErrorWithJSON(w, "lapak not found", http.StatusNotFound)
                return
            }
        }

	    w.WriteHeader(http.StatusNoContent)
    }
}

func restartBid(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        session := s.Copy()
        defer session.Close()

        IdLapak := pat.Param(r, "idlapak")

        c := session.DB("unique").C("recentbid")

        err := c.Remove(bson.M{"idlapak": IdLapak})
        if err != nil {
            switch err {
            default:
                jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
                log.Println("Failed delete recentbid: ", err)
                return
            case mgo.ErrNotFound:
                jsonhandler.ErrorWithJSON(w, "recentbid not found", http.StatusNotFound)
                return
            }
        }

        w.WriteHeader(http.StatusNoContent)
    }
}

