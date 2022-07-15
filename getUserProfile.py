import sys
import json
import ast
import requests
from bs4 import BeautifulSoup

session = requests.Session()
link = "https://sts.urfu.ru/adfs/OAuth2/authorize?response_type=code&client_id=https%3A%2F%2Fteamproject.urfu.ru%2Fapi%2Fauth%2Foauth2&redirect_uri=https%3A%2F%2Fteamproject.urfu.ru%2Fapi%2Fauth%2Foauth2&resource=https%3A%2F%2Fteamproject.urfu.ru%2Fapi%2Fauth%2Foauth2"

#ловим пароль и логин
input = ast.literal_eval(sys.argv[1])

log  = input['login']
pas = input['password']

data = {
    'AuthMethod': 'FormsAuthentication',
    'UserName': log,
    'Password': pas
}
header = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}

response = session.post(url=link, data=data)

soup = BeautifulSoup(response.text, 'html.parser')




output = input
if(soup.h2):
    output['data_returned'] = soup.h2.text
    output['enterStatus'] = True
else:
     output['data_returned'] = 'Ошибка входа, проверьте введенные данные'  
     output['enterStatus'] = False



print(json.dumps(output))

sys.stdout.flush()





