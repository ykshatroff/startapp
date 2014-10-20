import json
from django.http import HttpRequest, HttpResponse
from django.template.loader import render_to_string
from .models import generate_data


def index_view(request, template_name="index.html"):
    context = {}
    return HttpResponse(render_to_string(template_name, context))


def get_data_view(request):
    points = request.GET.get('points', 100)
    data = {
        'accountInfo': generate_data(points, columns=6),
        'appSuggStat': generate_data(points, columns=12),
        'appInfo': generate_data(points, columns=3),
    }
    return HttpResponse(json.dumps(data), content_type="application/json")
