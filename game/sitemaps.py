from django.contrib.sitemaps import Sitemap
from django.urls import reverse


class StaticViewSitemap(Sitemap):
    """
    정적 페이지들에 대한 사이트맵 클래스
    """
    priority = 0.8
    changefreq = 'weekly'

    def items(self):
        return ['game:index', 'game:play', 'game:customize', 'game:leaderboard', 'game:presentation']

    def location(self, item):
        return reverse(item) 