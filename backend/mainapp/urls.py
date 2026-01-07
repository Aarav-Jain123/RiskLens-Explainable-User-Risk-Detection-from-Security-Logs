from django.urls import path
from .views import *

urlpatterns = [
    path('', home, name='home'),
    path('model_page/', model_page, name='model page'),
    path("clean_dataset_page/", clean_dataset_page, name="clean dataset page"),
    path("dirty_dataset_page/", dirty_dataset_page, name="dirty dataset page"),
]

