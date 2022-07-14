import sys
import json
import ast
import requests
from bs4 import BeautifulSoup
from urllib import parse
import json

session = requests.Session()
link = "https://sts.urfu.ru/adfs/OAuth2/authorize?response_type=code&client_id=https%3A%2F%2Fteamproject.urfu.ru%2Fapi%2Fauth%2Foauth2&redirect_uri=https%3A%2F%2Fteamproject.urfu.ru%2Fapi%2Fauth%2Foauth2&resource=https%3A%2F%2Fteamproject.urfu.ru%2Fapi%2Fauth%2Foauth2"

#ловим пароль и логин
input = ast.literal_eval(sys.argv[1])

log  = input['login']
pas = input['password']

year = str(input['year'])
month = input['month']

link2 = 'https://ubu.urfu.ru/fse/scholarship/show/'+year+'/'+month

data = {
    'AuthMethod': 'FormsAuthentication',
     'UserName': log,
     'Password': pas
}
header = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}

response = session.post(url=link, data=data)

session.get(url='https://ubu.urfu.ru/fse/scholarship',  headers=header).text
response3 = session.get(url=link2,  headers=header).text


st = ''
soup = BeautifulSoup(response3, 'html.parser')
allStipa = soup.findAll('td')
totalMoney = soup.findAll('th')
length=0

commingMoney = []
takenMoney = []
allMoney = soup.find('th')
stipaTitle = soup.find('h1', class_='title')
st = stipaTitle.text + '\n----------------------------------------------------------------\n'
for i in range(len(allStipa)):
  if(i==0 or i%3==0):
    st = st + allStipa[i].text+":\n"
  elif(i==1 or i%3==1):
    commingMoney.append(allStipa[i].text)
    st = st + 'зачислено ' + (allStipa[i].text).replace('.','')+"\n"
  else:
    takenMoney.append(allStipa[i].text)
    st = st + 'удержано ' + (allStipa[i].text).replace('.','') 
    st = st + "\n----------------------------------------------------------------\n"

st = st +   'Итого:\nзачислено '+(totalMoney[-2].text).replace('.','')+   '\nудержано '+ totalMoney[-1].text




returned_data = st.replace(".","\n\n")



output = input
output['data_returned'] = returned_data

output['enterMoneyStatus'] = True



print(json.dumps(output))

sys.stdout.flush()





