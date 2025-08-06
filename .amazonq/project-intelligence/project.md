# Q CLI Conversation Viewer

## Project Purpose

The Q CLI Conversation Viewer is an **unofficial, open-source tool** designed to help developers visualize and analyze their Amazon Q Developer conversation history from the Q CLI. This project transforms raw JSON conversation files into an intuitive, interactive web interface that provides insights into AI-developer interactions.

## Problem Being Solved

Amazon Q Developer users generate conversation files through the Q CLI, but these files are:
- **Raw JSON format** - difficult to read and analyze manually
- **Complex structure** - nested messages, tool calls, and metadata
- **No visualization** - lack of visual representation of conversation flow
- **Limited insights** - no analytics on tool usage patterns or conversation statistics

## How It Works

The application provides a comprehensive solution through:

### Core Functionality
- **File Upload Interface** - Drag-and-drop or browse to upload Q CLI conversation JSON files
- **Schema Validation** - Built-in JSON schema validation ensures file compatibility
- **Multi-View Analysis** - Three distinct views for different analysis needs:
  - **Conversation View**: Visual flow of the entire conversation with message type indicators
  - **Summary View**: Analytics dashboard showing tool usage statistics and patterns
  - **Tools View**: Detailed specifications and schemas for all available tools

### Privacy-First Design
- **100% Local Processing** - All analysis happens in the browser, no data transmission
- **No External Dependencies** - No third-party APIs or tracking services
- **Open Source Transparency** - Full source code available for verification

## Target Users

- **Amazon Q Developer Users** - Developers using Q CLI who want to understand their AI interactions
- **Development Teams** - Teams analyzing AI tool usage patterns and effectiveness
- **Researchers** - Those studying human-AI collaboration patterns in development workflows

## Core Requirements

### Functional Requirements
1. **File Processing** - Parse and validate Q CLI conversation JSON files
2. **Conversation Visualization** - Display message flow with clear type differentiation
3. **Analytics Generation** - Provide statistics on tool usage and conversation patterns
4. **Tool Documentation** - Show detailed tool specifications and schemas
5. **Demo Capability** - Include sample conversations for demonstration

### Non-Functional Requirements
1. **Privacy** - No data leaves the user's device
2. **Performance** - Handle large conversation files efficiently
3. **Usability** - Intuitive interface requiring no technical expertise
4. **Compatibility** - Work across modern web browsers
5. **Accessibility** - Follow web accessibility standards

## Success Metrics

- **User Adoption** - Developers actively using the tool to analyze their Q conversations
- **Insight Generation** - Users gaining actionable insights about their AI tool usage
- **Community Engagement** - Open source contributions and feature requests
- **Privacy Assurance** - Zero data transmission incidents or privacy concerns

## Project Goals

### Primary Goals
1. **Democratize Q CLI Analysis** - Make conversation analysis accessible to all Q Developer users
2. **Enhance AI Understanding** - Help developers understand how they interact with AI tools
3. **Improve Development Workflows** - Enable optimization of AI-assisted development processes

### Secondary Goals
1. **Community Building** - Foster an open-source community around Q Developer tooling
2. **Educational Value** - Serve as a learning resource for AI-human interaction patterns
3. **Tool Evolution** - Provide feedback mechanism for Q Developer tool improvements

## Value Proposition

The Q CLI Conversation Viewer transforms opaque JSON files into actionable insights, enabling developers to:
- **Understand their AI usage patterns**
- **Optimize their development workflows**
- **Learn from successful AI interactions**
- **Maintain complete privacy and control over their data**

This tool bridges the gap between raw Q CLI output and meaningful analysis, empowering developers to become more effective in their AI-assisted development practices.
