import json
from django.http import HttpRequest, HttpResponse
from django.template.loader import render_to_string
import time
from .models import generate_data


def index_view(request, template_name="index.html"):
    context = {}
    return HttpResponse(render_to_string(template_name, context))


def get_data_view(request):
    points = request.GET.get('points', 100)
    period = request.GET.get('PERIOD', 600)
    app_id = request.GET.get('APP_ID', 0)
    data = {
        "appId": 0,
        "period": period,
        "startTime": int(time.time()),
        "time": [x for x in xrange(points)],
        'accountInfo': generate_data(points, columns=6),
        'appSuggStat': generate_data(points, columns=12),
        'appInfo': generate_data(points, columns=3),
    }
    return HttpResponse(json.dumps(data), content_type="application/json")
