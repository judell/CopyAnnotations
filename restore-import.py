filenames = [
    'index.ts',
]

for filename in filenames: 
    with open(filename, 'r+') as f:
        text = f.read()
        text = text.replace("//import * as hlib from '../../hlib/hlib'", "import * as hlib from '../../hlib/hlib'")
        f.seek(0)
        f.write(text)
        f.truncate()
        
