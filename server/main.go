package main

import (
	"context"
	pb "eventsApp.com/grpc/protos"
	"google.golang.org/grpc"
	"log"
	"math/rand"
	"net"
	"strconv"
	"fmt"
	"os"
	"os/signal"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

const (
	port = ":50051"
)

var events []*pb.EventInfo

type EventItem struct {
	Id           primitive.ObjectID `bson:"_id,omitempty"`
	Local        string             `bson:"local"`
	Date         string             `bson:"date"`
	EventTime    string             `bson:"eventTime"`
	Participants int32              `bson:"participants"`
	Price        float32            `bson:"price"`
}

type eventServer struct {
	pb.UnimplementedEventServer
}
var db *mongo.Client
var eventdb *mongo.Collection
var mongoCtx context.Context

func main() {
	
	// Configure 'log' package to give file name and line number on eg. log.Fatal
	// just the filename & line number:
	// log.SetFlags(log.Lshortfile)
	// Or add timestamps and pipe file name and line number to it:
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	fmt.Println("Starting server on port :50051...")

	// 50051 is the default port for gRPC
	// Ideally we'd use 0.0.0.0 instead of localhost as well
	listener, err := net.Listen("tcp", port)

	if err != nil {
		log.Fatalf("Unable to listen on port :50051: %v", err)
	}

	// slice of gRPC options
	// Here we can configure things like TLS
	opts := []grpc.ServerOption{}
	// var s *grpc.Server
	s := grpc.NewServer(opts...)
	// var srv *BlogServiceServer
	srv := &eventServer{}

	pb.RegisterEventServer(s, srv)

	// Initialize MongoDb client
	fmt.Println("Connecting to MongoDB...")
	mongoCtx = context.Background()
	db, err = mongo.Connect(mongoCtx, options.Client().ApplyURI("mongodb+srv://Michief:2005130mm@cluster0.uznqk.mongodb.net/sd"))
	if err != nil {
		log.Fatal(err)
	}
	err = db.Ping(mongoCtx, nil)
	if err != nil {
		log.Fatalf("Could not connect to MongoDB: %v\n", err)
	} else {
		fmt.Println("Connected to Mongodb")
	}

	eventdb = db.Database("sd").Collection("events")

	// Start the server in a child routine
	go func() {
		if err := s.Serve(listener); err != nil {
			log.Fatalf("Failed to serve: %v", err)
		}
	}()
	fmt.Println("Server succesfully started on port :50051")

	// Bad way to stop the server
	// if err := s.Serve(listener); err != nil {
	// 	log.Fatalf("Failed to serve: %v", err)
	// }
	// Right way to stop the server using a SHUTDOWN HOOK

	// Create a channel to receive OS signals
	c := make(chan os.Signal)

	// Relay os.Interrupt to our channel (os.Interrupt = CTRL+C)
	// Ignore other incoming signals
	signal.Notify(c, os.Interrupt)

	// Block main routine until a signal is received
	// As long as user doesn't press CTRL+C a message is not passed
	// And our main routine keeps running
	// If the main routine were to shutdown so would the child routine that is Serving the server
	<-c

	// After receiving CTRL+C Properly stop the server
	fmt.Println("\nStopping the server...")
	s.Stop()
	listener.Close()
	fmt.Println("Closing MongoDB connection")
	db.Disconnect(mongoCtx)
	fmt.Println("Done.")
}


func (s *eventServer) GetEvents(in *pb.Empty, stream pb.Event_GetEventsServer) error {
	data := &EventItem{}
	cursor, err := eventdb.Find(context.Background(), bson.D{{}})
	if err != nil {
		return status.Errorf(
			codes.Internal,
			fmt.Sprintf("Internal error: %v", err),
		)
	}
	defer cursor.Close(context.Background())
	for cursor.Next(context.Background()) {
		err := cursor.Decode(data)
		if err != nil {
			return status.Errorf(
				codes.Unavailable,
				fmt.Sprintf("Could not decode data: %v", err),
			)
		}
		stream.Send(&pb.EventInfo{
			Id:           data.Id.Hex(),
			Local:        data.Local,
			Date:         data.Date,
			EventTime:    data.EventTime,
			Participants: data.Participants,
			Price:        data.Price,
		})
	}
	if err := cursor.Err(); err != nil {
		return status.Errorf(
			codes.Internal,
			fmt.Sprintf("Unknown cursor error: %v", err),
		)
	}
	return nil
}

func (s *eventServer) GetEvent(ctx context.Context, in *pb.EventId) (*pb.EventInfo, error) {
	oid, err := primitive.ObjectIDFromHex(in.GetId())
	if err != nil {
		return nil, status.Errorf(
			codes.InvalidArgument,
			fmt.Sprintf("Could not convert to ObjectId: %v", err),
		)
	}
	result := eventdb.FindOne(ctx, bson.M{"_id": oid})
	data := EventItem{}

	if err := result.Decode(&data); err != nil {
		return nil, status.Errorf(
			codes.NotFound,
			fmt.Sprintf("Could not find event with Object Id %s: %v", in.GetId(), err),
		)
	}
	response := &pb.EventInfo{
		Id:           data.Id.Hex(),
		Local:        data.Local,
		Date:         data.Date,
		EventTime:    data.EventTime,
		Participants: data.Participants,
		Price:        data.Price,
	}
	return response, nil
}

func (s *eventServer) CreateEvent(ctx context.Context, in *pb.EventInfo) (*pb.EventId, error) {
	log.Printf("Received: %v", in)
	res := &pb.EventId{}
	res.Id = strconv.Itoa(rand.Intn(10000000))
	in.Id = res.GetId()
	events = append(events, in)
	return res, nil
}

func (s *eventServer) UpdateEvent(ctx context.Context, in *pb.EventInfo) (*pb.Status, error) {
	log.Printf("Received: %v", in)
	res := &pb.Status{}
	for index, event := range events {
		if event.GetId() == in.GetId() {
			events = append(events[:index], events[index+1:]...)
			in.Id = event.GetId()
			events = append(events, in)
			res.Status = "Updated"
			break
		}
	}
	return res, nil
}
