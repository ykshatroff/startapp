from django.http import HttpRequest, HttpResponse


def get_data_view(request):
    return HttpResponse("hello")
