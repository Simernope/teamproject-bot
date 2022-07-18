import sys
import json
import ast
import requests
from bs4 import BeautifulSoup
from urllib import parse
import json

session = requests.Session()
link = "https://sts.urfu.ru/adfs/OAuth2/authorize?response_type=code&client_id=https%3A%2F%2Fteamproject.urfu.ru%2Fapi%2Fauth%2Foauth2&redirect_uri=https%3A%2F%2Fteamproject.urfu.ru%2Fapi%2Fauth%2Foauth2&resource=https%3A%2F%2Fteamproject.urfu.ru%2Fapi%2Fauth%2Foauth2"
linkNewIteration = "https://teamproject.urfu.ru/api/projects/19827/iterations/"
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
for i in range(len(iterationsDict) + 1):
  iterationsList[projectTitle][iterationsDict['items'][i]['title']]={'Начало итерации':'', 'Конец итерации': ''}
  iterationsList[projectTitle][iterationsDict['items'][i]['title']]['Начало итерации'] = str(iterationsDict['items'][i]['estimation_date_begin'])
  iterationsList[projectTitle][iterationsDict['items'][i]['title']]['Конец итерации'] = str(iterationsDict['items'][i]['estimation_date_end'])
  iterationsList[projectTitle][str(iterationsDict['items'][i]['title'])]['ID итерации'] = str(iterationsDict['items'][i]['id'])
  linkNewIteration = linkNewIteration + iterationsList[projectTitle][str(iterationsDict['items'][i]['title'])]['ID итерации']+ "/my-estimation-status/"
  responseNewIteration = session.get(url=linkNewIteration,  headers={'authorization':jwtToken}).text
  unquotedResponseNewIteration = parse.unquote(responseNewIteration)
  responseNewIterationDict = json.loads(responseNewIteration)
  iterationsList[projectTitle][str(iterationsDict['items'][i]['title'])]['Вы оценили'] = responseNewIterationDict['number_of_scores']['outgoing']
  iterationsList[projectTitle][str(iterationsDict['items'][i]['title'])]['Вас оценили'] = responseNewIterationDict['number_of_scores']['incoming']
  iterationsList[projectTitle][str(iterationsDict['items'][i]['title'])]['Колличество студентов'] = responseNewIterationDict['number_of_students']



output = input




if(iterationsList):
    output['data_returned'] = iterationsList
    output['enterMoneyStatus'] = True
    output['new_iterations'] = {'Разработка дополнительных модулей для сервиса записи на проектное обучение': {'Анализ': {'Начало итерации': '2022-05-15', 'Конец итерации': '2022-06-01', 'ID итерации': '15197', 'Вы оценили': 6, 'Вас оценили': 6, 'Колличество студентов': 6}, 'Разработка': {'Начало итерации': '2022-05-29', 'Конец итерации': '2022-06-08', 'ID итерации': '17391', 'Вы оценили': 6, 'Вас оценили': 6, 'Колличество студентов': 6}, 'Тестирование': {'Начало итерации': '2022-06-05', 'Конец итерации': '2022-06-15', 'ID итерации': '17392', 'Вы оценили': 6, 'Вас оценили': 6, 'Колличество студентов': 6}, 'Презентация': {'Начало итерации': '2022-06-12', 'Конец итерации': '2022-06-18', 'ID итерации': '17393', 'Вы оценили': 6, 'Вас оценили': 6, 'Колличество студентов': 6}, 'Представление': {'Начало итерации': '2022-08-12', 'Конец итерации': '2022-09-18', 'ID итерации': '17398', 'Вы оценили': 0, 'Вас оценили': 4, 'Колличество студентов': 6}}}
else:
     output['data_returned'] = 'Итерации еще не добавлены...'
     output['enterMoneyStatus'] = False



print(json.dumps(output))

sys.stdout.flush()





