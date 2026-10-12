# Contributing to DrishtiPharma

Thank you for your interest in contributing to **DrishtiPharma**! We welcome community contributions, bug reports, accessibility audits, and pull requests to help advance assistive healthcare technologies.

## Code of Conduct
We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Please be respectful and constructive in all discussions.

## How to Contribute
1. **Fork the Repository** to your own GitHub account.
2. **Create a Feature Branch** (`git checkout -b feature/amazing-accessibility-feature`).
3. **Set Up Your Development Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Or: venv\Scripts\activate on Windows
   pip install -r requirements.txt
   copy .env.example .env
   ```
4. **Make Your Changes**:
   - Adhere to PEP 8 standards.
   - Maintain WCAG 2.2 AAA visual contrast standards for UI components.
   - Never commit sensitive API keys or credentials.
5. **Test Your Changes**:
   ```bash
   python backend_server.py
   ```
6. **Submit a Pull Request** with a detailed explanation of your changes and before/after screenshots if UI elements were modified.

## Bug Reports & Feature Requests
Please use GitHub Issues to report bugs or suggest enhancements. Include:
- A descriptive title
- Steps to reproduce
- Expected vs. actual behavior
- Packaging type (e.g. blister pack, bottle, cut strip) and lighting condition
