#!/usr/bin/env python3
"""
Convert BLUEPRINT.md to bot-compatible format
- Change ### Enhanced Prompt to ## Enhanced Prompt
- Replace "End of prompt" with "---END PROMPT---"
- Remove duplicate prompts (keep first occurrence)
"""

import re
from pathlib import Path

def convert_blueprint():
    input_file = Path("BLUEPRINT.md")
    output_file = Path("DIRT_FREE_PROMPTS.md")

    print(f"Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"Original file size: {len(content)} bytes")

    # Track which prompt numbers we've seen
    seen_prompts = set()
    lines = content.split('\n')
    output_lines = []
    current_prompt_num = None
    skip_until_next_prompt = False

    for i, line in enumerate(lines):
        # Check if this is a prompt header
        match = re.match(r'^###\s+Enhanced Prompt\s+(\d+):\s+(.+)$', line)

        if match:
            prompt_num = int(match.group(1))
            title = match.group(2).strip()

            # Check if we've already seen this prompt
            if prompt_num in seen_prompts:
                print(f"Skipping duplicate: Prompt {prompt_num} - {title}")
                skip_until_next_prompt = True
                continue
            else:
                print(f"Processing: Prompt {prompt_num} - {title}")
                seen_prompts.add(prompt_num)
                skip_until_next_prompt = False
                current_prompt_num = prompt_num

                # Convert ### to ##
                output_lines.append(f"## Enhanced Prompt {prompt_num}: {title}")
                continue

        # If we're skipping a duplicate, continue until next prompt
        if skip_until_next_prompt:
            continue

        # Replace "End of prompt" with "---END PROMPT---"
        if line.strip() == "End of prompt":
            output_lines.append("\n---END PROMPT---\n")
            continue

        # Keep all other lines
        output_lines.append(line)

    # Join output
    output_content = '\n'.join(output_lines)

    # Clean up multiple consecutive blank lines (max 2 in a row)
    output_content = re.sub(r'\n{4,}', '\n\n\n', output_content)

    # Save output
    print(f"\nWriting to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(output_content)

    print(f"Output file size: {len(output_content)} bytes")
    print(f"Total unique prompts: {len(seen_prompts)}")
    print(f"Prompts included: {sorted(seen_prompts)}")
    print("\n✅ Conversion complete!")
    print(f"Output saved to: {output_file.absolute()}")

if __name__ == "__main__":
    convert_blueprint()
