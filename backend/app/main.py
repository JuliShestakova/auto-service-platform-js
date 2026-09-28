from fastapi import FastAPI


app = FastAPI(
    title="Найти сервис API",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "Найти сервис API работает"
    }