import re

llm_response = open('./zideal.md', 'r').read()

# Regular expression to match the file path and code block content
pattern = r"```([^\n]*)\n(.*?)```"

matches = re.findall(pattern, llm_response, re.DOTALL)

for match in matches:
    file_path = match[0]
    code_content = match[1]
    
    # Write new content to the file
    try:
        with open("solution."+file_path, 'w') as f:
            # Remove leading whitespace/newlines
            f.write(code_content.lstrip())
        print(f"Successfully updated {file_path}")
    except Exception as e:
        raise Exception(f"Error writing to {file_path}: {str(e)}")
   
   
package = ''.join(open('./zpackage.md', 'r').readlines()[1:-1])
open( './package.json', 'w' ).write(  package)

test = ''.join(open('./ztest.md', 'r').readlines()[1:-1])
open( './solution.test.js', 'w' ).write(  test)