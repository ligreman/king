### Docker

You can try King for Kong using [docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/) with the next command.

```
docker-compose up -d
```

This will create a Kong Api Gateway container, a Postgresql container and finally a King for king container. After that King for Kong will be available at `http://localhost:8080` in production mode
