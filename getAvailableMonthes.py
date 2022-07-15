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

session.get(url='https://ubu.urfu.ru/fse/scholarship',  headers=header).text
response3 = session.get(url='https://ubu.urfu.ru/fse/scholarship',  headers=header).text
soup = BeautifulSoup(response3, 'html.parser')
years = soup.find_all('h4')
availableYears = []
data = {}
for year in years:
  availableYears.append(year.text)
  data[year.text] = []

monthes = soup.find_all('a')
availableMonthes = []
for year in availableYears:
  for month in monthes:
    res = str(month)
    if (year) in res:
      availableMonthes.append(month.text)
      data[year].append(month.text)    

#data = str(data)

output = input

if(data):
    output['data_returned'] = data
    output['enterMoneyStatus'] = True
else:
     output['data_returned'] = 'У вас нет доступных дат для просмотра доходов...'  
     output['enterMoneyStatus'] = False



print(json.dumps(output))

sys.stdout.flush()





