#! /usr/bin/env python3

import urllib.request

print("Content-Type: text/plain\n\n")

try:
    print(urllib.request.urlopen("https://api.ring.nlnog.net/1.0/participants").read().decode('utf-8'))
except:
    print("""{
    "info": {    
        "success": 0
      },
}""")
