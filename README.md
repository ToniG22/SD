## Projeto SD

#To run the project locally

-clint side :
cd path/to/client
npm install
npm start

-server side:
cd path/to/server
go mod tidy
go run main.go

#To run the project use

kubectl port-forward svc/webapp-service 3000:3000 -n sge
