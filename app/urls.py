from django.conf.urls import patterns, include, url

#from django.contrib import admin
#admin.autodiscover()

urlpatterns = patterns('',
    #url(r'^admin/', include(admin.site.urls)),
    #
    url(r'^$', 'theapp.views.index_view', name="index"),
    url(r'^jx/stat/$', 'theapp.views.get_data_view', name="get_data"),
)
