package socket

import(
	"net/http"
	"time"
    "log"

	"github.com/gorilla/websocket"
	"goji.io"
    "goji.io/pat"
    "gopkg.in/mgo.v2/bson"
    "gopkg.in/mgo.v2"

    "../models/lapak"
    "../models/recentbid"
    "../jsonhandler"
)

var upgrader = websocket.Upgrader{}
var clients = make(map[*websocket.Conn]bool)

type DataSend struct {
	NomorUrut 		int 	`json:"nomorurut"`
	HargaSementara 	int 	`json:"hargasementara"`
	BatasPenawaran 	int 	`json:"bataspenawaran"`
	UsernamePembeli string 	`json:"usernamepembeli"`
	HargaTawar 		int 	`json:"hargatawar"`	 
}

func RoutesSocket(mux *goji.Mux, session *mgo.Session){
	mux.HandleFunc(pat.New("/lapak/room/:idlapak"), GetRoomLapak(session))
}	 	

func remove(s []DataSend, r DataSend) []DataSend {
    for i, v := range s {
        if v == r {
            return append(s[:i], s[i+1:]...)
        } 
    }
    return s
}

func GetRoomLapak(s *mgo.Session) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
	 	
    	//for connection
	 	conn, error := (&websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}).Upgrade(w, r, nil)
	 	if error != nil {
        	http.NotFound(w, r)
        	return
    	}
	 	clients[conn] = true
	 	//

	 	idlapak := pat.Param(r, "idlapak")
	 	session := s.Copy()
    	
		cLapak := session.DB("unique").C("lapak")
		cRecentBid := session.DB("unique").C("recentbid")

		go func(conn *websocket.Conn){
			for {
				_, _, err := conn.ReadMessage()
				if err != nil {
					for client := range clients {
						if(client == conn){
							delete(clients, client)
						}
					}
					if(clients[conn] == false){
						conn.Close()
						defer session.Close()
						log.Println("Starting Listen server....")
						return
					}
				}
			}
		}(conn)

	 	go func(conn *websocket.Conn){
	 		ch := time.Tick(250 * time.Millisecond)	 		
	 		var lapak lapak.Lapak
	 		var recentbids []recentbid.RecentBid
	 		var datasend []DataSend

		 	for range ch {
		 		if(clients[conn] == true){
			 		//log.Println("Lapak " +idlapak+ " Work")
			 		log.Println(clients)

			 		//lapak
				    err := cLapak.Find(bson.M{"idlapak": idlapak}).One(&lapak)
				    if err != nil {
				        jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
				        log.Println("Failed find lapak: ", err)
				        return
				    }
				    if lapak.IdLapak == "" {
				        jsonhandler.ErrorWithJSON(w, "lapak not found", http.StatusNotFound)
				        return
				    }	

				    //recentbid

				    err = cRecentBid.Find(bson.M{"idlapak": idlapak}).Sort("-hargatawar").Limit(3).All(&recentbids)
				    if err != nil {
				        jsonhandler.ErrorWithJSON(w, "Database error", http.StatusInternalServerError)
				        log.Println("Failed find recentbid: ", err)
				        return
				    }

				    for nomorurut,scoreboard := range recentbids {
				    	datasend = append(datasend, DataSend{NomorUrut: nomorurut,HargaSementara: lapak.HargaSementara, BatasPenawaran: lapak.BatasPenawaran, 
						UsernamePembeli: scoreboard.UsernamePembeli, HargaTawar: scoreboard.HargaTawar})
					}

					conn.WriteJSON(datasend)
					
					for i := 0; i < len(datasend); i++ {
						datasend = remove(datasend, datasend[i])
						i--;
					}
			 	}
			}	
	 	}(conn)
	 }
}

