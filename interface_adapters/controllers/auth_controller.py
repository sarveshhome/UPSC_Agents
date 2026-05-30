from use_cases.auth import RegisterUser, AuthenticateUser
from pydantic import BaseModel
from typing import Optional


class RegisterRequest(BaseModel):
    name: str
    username: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    message: str


class AuthController:
    def __init__(self, register_user: RegisterUser, authenticate_user: AuthenticateUser):
        self.register_user = register_user
        self.authenticate_user = authenticate_user

    def register(self, request: RegisterRequest) -> dict:
        user = self.register_user.execute(request.name, request.username, request.password)
        if user:
            return {"success": True, "message": "User registered successfully"}
        return {"success": False, "message": "Username already exists"}

    def login(self, request: LoginRequest) -> LoginResponse:
        success, token = self.authenticate_user.execute(request.username, request.password)
        if success:
            return LoginResponse(success=True, token=token, message="Login successful")
        return LoginResponse(success=False, message="Invalid credentials")