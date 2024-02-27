"""
Program for randomizing the order of questions.

Takes two console arguments:
Argument 1: filename with questions
Argument 2: Number of questions to select (-1 to use all)

Outputs a new file called 'current_questions.json'.
"""

import json
import sys
import random

# Parse arguments
in_file = sys.argv[1]
num_questions = int(sys.argv[2])

# Open specified json file
with open(in_file,'r') as f:
    question_list = json.load(f)

# Randomize question order
random.shuffle(question_list)

# Cut off unnecessary questions
if num_questions >= 0:
    del question_list[num_questions:]

# Randomize answer order
for question in question_list:
    l = list(enumerate(question["options"]))
    random.shuffle(l)
    indices, question["options"] = zip(*l)
    question["answer"] = indices.index(question["answer"])

# Write resulting json file
with open('current_questions.json','w') as f:
    json.dump(question_list, f, ensure_ascii=False, indent=4)
