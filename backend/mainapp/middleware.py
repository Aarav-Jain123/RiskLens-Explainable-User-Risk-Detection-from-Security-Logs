from django.shortcuts import redirect
from django.urls import reverse

class StaffRequiredMiddleware:
    """
    Middleware that ensures only staff members can access the admin site.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith(reverse('admin:index')) and not request.user.is_staff:
            return redirect('/')  # Or wherever you want to redirect non-staff users
        return self.get_response(request)