package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Event struct {
	Id           primitive.ObjectID `bson:"_id,omitempty"`
	Name         string             `bson:"name"`
	Local        string             `bson:"local"`
	Date         time.Time          `bson:"date"`
	EventTime    string             `bson:"eventTime"`
	Participants int32            	`bson:"participants"`
	Price        float64			`bson:"price"`
}

var db *mongo.Client
var eventdb *mongo.Collection
var mongoCtx context.Context

func main() {
	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET, POST, PUT, DELETE,PATCH",
	}))
	go func() {
		mongoCtx = context.Background()
		clientOptions := options.Client().ApplyURI("mongodb+srv://Michief:2005130mm@cluster0.uznqk.mongodb.net/sd")
		var err error
		db, err = mongo.Connect(mongoCtx, clientOptions)
		if err != nil {
			log.Fatal(err)
		}
		err = db.Ping(mongoCtx, nil)
		if err != nil {
			log.Fatal(err)
		}
		eventdb = db.Database("sd").Collection("events")
		fmt.Println("Connected to MongoDB!")
	}()

	app.Get("/", func(c *fiber.Ctx) error {
		log.Println("Hello World")
		return c.SendString("Hello, World 👋🦝!")
	})

	app.Get("/events", func(c *fiber.Ctx) error {
		log.Println("Get Events")

		// Retrieve events from MongoDB
		cursor, err := eventdb.Find(mongoCtx, primitive.D{})
		if err != nil {
			log.Fatal(err)
			return c.Status(500).SendString("Internal Server Error")
		}
		defer cursor.Close(mongoCtx)
		log.Println(cursor)
		var events []*Event
		if err := cursor.All(mongoCtx, &events); err != nil {
			log.Fatal(err)
			return c.Status(500).SendString("Internal Server Error")
		}
		log.Println(c.JSON(events))

		return c.JSON(events)
	})

	app.Get("/events/:id", func(c *fiber.Ctx) error {
		log.Println("Get Event")

		paramID := c.Params("id")
		id, err := primitive.ObjectIDFromHex(paramID)
		if err != nil {
			return c.Status(400).SendString(err.Error())
		}

		// Retrieve a specific event from MongoDB
		var event Event
		err = eventdb.FindOne(mongoCtx, primitive.M{"_id": id}).Decode(&event)
		if err != nil {
			log.Fatal(err)
			return c.Status(404).SendString("Event not found")
		}

		return c.JSON(event)
	})

	app.Post("/events", func(c *fiber.Ctx) error {
		log.Println("Create Event")
		rawBody := c.Body()
    	log.Printf("Raw Request Body: %s", rawBody)
		event := new(Event)
		
		// Attempt to parse the request body into the Event struct
		if err := c.BodyParser(&event); err != nil {
			log.Println("Error parsing request body:", err)
			return c.Status(400).SendString("Invalid request body")
		}
	
		// Insert the event into MongoDB
		result, err := eventdb.InsertOne(mongoCtx, event)
		if err != nil {
			log.Println("Error inserting event into MongoDB:", err)
			return c.Status(500).SendString("Internal Server Error")
		}
	
		// Set the generated ObjectID to the event
		event.Id = result.InsertedID.(primitive.ObjectID)
	
		return c.JSON(event)
	})

	app.Patch("/events/:id", func(c *fiber.Ctx) error {
		log.Println("Update Event")
	
		// Get the event ID from the request params
		id, err := primitive.ObjectIDFromHex(c.Params("id"))
		if err != nil {
			log.Println("Error converting ID:", err)
			return c.Status(400).SendString("Invalid ID")
		}
		
	
		// Create a new Event struct to hold the updated fields
		updateFields := make(map[string]interface{})
		log.Println(updateFields)
		// Parse the request body into a map
		if err := c.BodyParser(&updateFields); err != nil {
			log.Println("Error parsing request body:", err)
			return c.Status(400).SendString("Invalid request body")
		}

		// Construct the update document
		update := primitive.D{{Key: "$set", Value: updateFields}}

		// Update the event in MongoDB
		result, err := eventdb.UpdateOne(mongoCtx, primitive.M{"_id": id}, update)
		if err != nil {
			log.Println("Error updating event in MongoDB:", err)
			return c.Status(500).SendString("Internal Server Error")
		}
	
		// Check if any documents were modified
		if result.ModifiedCount == 0 {
			return c.Status(404).SendString("Event not found or no changes applied")
		}
	
		return c.SendString("Event updated successfully")
	})

	app.Delete("/events/:id", func(c *fiber.Ctx) error {
		log.Println("Delete Event")
	
		id, err := primitive.ObjectIDFromHex(c.Params("id"))
		if err != nil {
			return c.Status(400).SendString(err.Error())
		}
	
		// Delete the event from MongoDB
		result, err := eventdb.DeleteOne(mongoCtx, primitive.M{"_id": id})
		if err != nil {
			log.Fatal(err)
			return c.Status(500).SendString("Internal Server Error")
		}
	
		// Check if any documents were deleted
		if result.DeletedCount == 0 {
			return c.Status(404).SendString("Event not found")
		}
	
		return c.SendString("Event deleted successfully")
	})
	

	

	log.Fatal(app.Listen(":3000"))
}