package searchengine

import(
	"net/http"
    "log"
    "encoding/json"

	"goji.io"
    "goji.io/pat"
    "gopkg.in/mgo.v2/bson"
    "gopkg.in/mgo.v2"

    "../models/lapak"
    "../jsonhandler"
)


type Filter struct {
	Kategori 	string 		`json:"kategori"`
	Sertifikat 	int  		`json:"sertifikat"` //ya atau tidak
	Waktu		string		`json:"waktu"`		//default ,baru, lama
	MinHarga	int 		`json:"minharga"`	
	MaxHarga	int 		`json:"maxharga"`
}
 

func RoutesSearchEngine(mux *goji.Mux, session *mgo.Session){
	mux.HandleFunc(pat.Get("/searchengine/:keywords"), SearchEngine(session))
	mux.HandleFunc(pat.Post("/filter/:keywords"), FilterEngine(session)) //filter berdasarkan kategori, sertifikat, tanggal pembuatan lapak, dan range harga
}

func SearchEngine(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
    	session := s.Copy()
        defer session.Close()

        keywords := pat.Param(r, "keywords")

        c := session.DB("unique").C("lapak")

        var lapaks []lapak.Lapak
	    err := c.Find(bson.M{"namalapak": &bson.RegEx{Pattern: keywords, Options: "i"}}).All(&lapaks)
	    if err != nil {
	      jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
	      log.Println("Failed find lapak: ", err)
	      return
	    }

	    respBody, err := json.MarshalIndent(lapaks, "", "  ")
	    if err != nil {
	      log.Fatal(err)
	    }

	    jsonhandler.ResponseWithJSON(w, respBody, http.StatusOK)
  
	}
}

func FilterEngine(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
    	session := s.Copy()
        defer session.Close()

        var filter Filter

        keywords := pat.Param(r, "keywords")

        decoder := json.NewDecoder(r.Body)
        err := decoder.Decode(&filter)
        if err != nil {
            jsonhandler.ErrorWithJSON(w, "Incorrect body", http.StatusBadRequest)
            return
        }

        c := session.DB("unique").C("lapak")

        var lapaks []lapak.Lapak
        
        if filter.Waktu == "default" {
	    	err = c.Find(bson.M{"$and": []bson.M{ bson.M{"namalapak": &bson.RegEx{Pattern: keywords, Options: "i"}}, bson.M{"$or": 
	    		[]bson.M{bson.M{"kategori": filter.Kategori},bson.M{"sertifikat": filter.Sertifikat}}}}}).All(&lapaks)
	    	if err != nil {
		      jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
		      log.Println("Failed find lapak: ", err)
		      return
	    	}
	    } else if filter.Waktu == "baru" {
	    	err = c.Find(bson.M{"$and": []bson.M{ bson.M{"namalapak": &bson.RegEx{Pattern: keywords, Options: "i"}}, bson.M{"$or": 
	    		[]bson.M{bson.M{"kategori": filter.Kategori},bson.M{"sertifikat": filter.Sertifikat}}}}}).Sort("-waktu").All(&lapaks)
	    	if err != nil {
		      jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
		      log.Println("Failed find lapak: ", err)
		      return
	    	}
	    } else if filter.Waktu == "lama" {
	    	err = c.Find(bson.M{"$and": []bson.M{ bson.M{"namalapak": &bson.RegEx{Pattern: keywords, Options: "i"}}, bson.M{"$or": 
	    		[]bson.M{bson.M{"kategori": filter.Kategori},bson.M{"sertifikat": filter.Sertifikat}}}}}).Sort("waktu").All(&lapaks)
	    	if err != nil {
		      jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
		      log.Println("Failed find lapak: ", err)
		      return
	    	}
	    }

	    respBody, err := json.MarshalIndent(lapaks, "", "  ")
	    if err != nil {
	      log.Fatal(err)
	    }

	    jsonhandler.ResponseWithJSON(w, respBody, http.StatusOK)
  
	}
}