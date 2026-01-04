from django.urls import path
from .views import *

urlpatterns = [
    path('', home, name='home'),
    path('model_page/', model_page, name='model page'),
]
