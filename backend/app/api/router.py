from fastapi import APIRouter
from app.api.routes import auth, users, organizations, stock, sales, analytics, suppliers

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(organizations.router)
api_router.include_router(stock.router)
api_router.include_router(sales.router)
api_router.include_router(analytics.router)
api_router.include_router(suppliers.router)

