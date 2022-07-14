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

data = {
    'AuthMethod': 'FormsAuthentication',
    'UserName': log,
     'Password': pas
}
header = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}

response = session.post(url=link, data=data)

soup = BeautifulSoup(response.text, 'html.parser')

jwt = soup.find('meta', attrs={'name': 'jwt'})['content']

jwtToken = 'JWT '+jwt
if(jwtToken):
  responseCurrentProjectPage = session.get(url='https://teamproject.urfu.ru/api/projects/?status=completed&size=3&page=1&year=2021&semester=2',  headers={'authorization':jwtToken})



currentProjectPage = responseCurrentProjectPage.text

unquotedCurrentProjectPage = parse.unquote(currentProjectPage)

projectPageDict = json.loads(unquotedCurrentProjectPage)

projectTitle =str(projectPageDict['items'][0]['title'])

projectId = str(projectPageDict['items'][0]['id'])
linkForIteration = 'https://teamproject.urfu.ru/api/projects/'+projectId+'/iterations/'


if(linkForIteration):
  responseIteration = session.get(url=linkForIteration,  headers={'authorization':jwtToken})
responseIteration = responseIteration.text
unquotedIterations = parse.unquote(responseIteration)
iterationsDict = json.loads(unquotedIterations)
iterationsDict['items'][0]['title']

iterationsList = {}

iterationsList[projectTitle] = {}
for i in range(len(iterationsDict)):
  iterationsList[projectTitle][iterationsDict['items'][i]['title']]={'Начало итерации':'', 'Конец итерации': ''}
  iterationsList[projectTitle][iterationsDict['items'][i]['title']]['Начало итерации'] = str(iterationsDict['items'][i]['estimation_date_begin'])
  iterationsList[projectTitle][iterationsDict['items'][i]['title']]['Конец итерации'] = str(iterationsDict['items'][i]['estimation_date_end'])



output = input
#data.charCodeAt(0) === 65279



if(iterationsList):
    output['data_returned'] = iterationsList
    output['enterMoneyStatus'] = True
else:
     output['data_returned'] = 'У вас нет доступных дат для просмотра доходов...'  
     output['enterMoneyStatus'] = False



print(json.dumps(output))

sys.stdout.flush()





