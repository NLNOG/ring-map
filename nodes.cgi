#! /usr/bin/env python

import urllib2

print "Content-Type: text/plain\n\n"

try:
    print urllib2.urlopen("https://api.ring.nlnog.net/1.0/nodes").read()
except:
    print """{
    "info": {    
        "success": 0
      },
}"""
