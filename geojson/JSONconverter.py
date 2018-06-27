import json
inputFile = open('CORRECT_COORDS_DATASET.json', 'r')
inputCoords = json.load(inputFile)
inputFile.close()
outputFile = open('WRONG_COORDS_DATASET.json', 'r+')
outputCoords = json.load(outputFile)
for i in outputCoords['features']:
    for j in inputCoords['features']:
        if i['properties']['ID'] == j['properties']['Name']:
            i['geometry']['coordinates'][0] = j['geometry']['coordinates'][0]
            i['geometry']['coordinates'][1] = j['geometry']['coordinates'][1]
            break
outputFile.truncate()
json.dump(outputCoords, outputFile)
outputFile.close()