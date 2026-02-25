# .coze File Format

## Purpose
The `.coze` file is a metadata file required by the Skill packaging system. It identifies the Skill and provides essential information for deployment.

## Format
The file uses standard YAML format with the following required fields:

### Required Fields
- `name`: The unique identifier for the Skill (must be lowercase with hyphens)
- `description`: A brief description of the Skill's functionality
- `version`: The version number (semver format recommended)

### Optional Fields
- `author`: The creator or team name
- `license`: The license type
- `tags`: Array of tags for categorization

## Example
```yaml
name: ai-creative-hub
description: Commercial-grade AI creative workstation
version: 1.0.0
author: AI Creative Team
license: MIT
tags:
  - ai
  - creative
```

## Important Notes
1. The file must be named exactly `.coze` (with the dot)
2. It must be located in the project root directory
3. Use lowercase for the `name` field
4. Use hyphens instead of spaces in the `name` field
5. Keep description concise (under 200 characters)
6. Use semantic versioning for `version`

## Validation
Run the pre-build check script to verify the file:
```bash
./pre-build-check.sh
```

## Common Issues

### Issue: "skill name not found in .coze file"
**Solution**: Ensure the file:
1. Exists in the project root
2. Has the correct filename (`.coze`)
3. Contains a `name` field
4. Uses valid YAML syntax

### Issue: YAML syntax error
**Solution**: Validate the YAML format:
- Use spaces, not tabs
- Ensure proper indentation
- Quote strings with special characters

## Current Configuration
```yaml
name: ai-creative-hub
description: Commercial-grade AI creative workstation with intelligent routing for image, video, and audio generation
version: 1.0.0
```

This configuration identifies the Skill as:
- **Name**: ai-creative-hub
- **Purpose**: AI creative workstation
- **Version**: 1.0.0 (initial release)
- **Capabilities**: Image, video, and audio generation with intelligent routing
