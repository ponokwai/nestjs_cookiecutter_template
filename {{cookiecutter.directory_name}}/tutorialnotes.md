**NESTJS**
- HPPP componet optaions: Platform-express vs platform-fastify

All Server | nestjs key steps:
Validate data | pipe -> Authenticate User | guard -> Route Request to particular f(n) | controller -> run some business logic | service -> access to database | repository

**Parts of NESTJS**
- Controllers: handles incoming requests
- Services: data access and business logic
- Modules: Group codes together
- Pipes: validate incoming data
- Filters: handles errors that occurs during request handling
- Guards: Handles authentication
- Interceptors: add extra logic to incoming requests or outgoing responses
- Repositories: handles data stored in DB

**HTTP request is sectioned as follows:**
Start: url POST /messages?.. | @param(), @query()
Header: content-type, host etc | @header()
Body | @body()

**Setting up automatic validation**
1. Tell NEST to use global validation (set-up in main.ts)
2. Create a class that describes the different properties that the request body should have
3. Add validation rules to the class
4. Apply that class to the request handler


**Key Installations**
- sample api code
- pipe set-up for data validation
- swagger baseUrl/api
TODO: 
- observability [logging, open telementary, promethus]
- devops