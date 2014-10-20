# -*- coding: utf-8 -*-
import random


def generate_data(points=100, columns=1, data_range=(0, 100)):

    def generate_entry():
        return tuple([random.randint(*data_range) for x in xrange(columns)])

    return [generate_entry() for x in xrange(points)]