from rest_framework_simplejwt.authentication import JWTAuthentication


class SilentJWTAuthentication(JWTAuthentication):
    """Returns None instead of raising on a bad/expired token, so public
    endpoints keep working when the client sends a stale one."""

    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except Exception:
            return None
