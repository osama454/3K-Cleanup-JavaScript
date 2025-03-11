# extract_solution_test.py
import os
import re

llm_response = open('./zideal.md', 'r').read()

# Regular expression to match the file path and code block content
pattern = r"`([^\n]*)`\s*\n```[^\n]*\n(.*?)```"

matches = re.findall(pattern, llm_response, re.DOTALL)

for match in matches:
    file_path = match[0]
    code_content = match[1]
    
    # Write new content to the file
    try:
        with open(file_path, 'w') as f:
            # Remove leading whitespace/newlines
            f.write(code_content.lstrip())
        print(f"Successfully updated {file_path}")
    except Exception as e:
        raise Exception(f"Error writing to {file_path}: {str(e)}")