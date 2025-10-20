# Project Structure Reorganization Plan

## New Directory Structure

```
edhrecscraper/
├── src/                          # Source code
│   ├── core/                     # Core business logic
│   │   ├── __init__.py
│   │   ├── commander_data.py     # Data loading and filtering
│   │   ├── scryfall_integration.py  # Scryfall API wrapper
│   │   └── url_utils.py          # URL generation utilities
│   │
│   ├── service/                  # Service layer (API for frontends)
│   │   ├── __init__.py
│   │   └── commander_service.py  # Main service interface
│   │
│   ├── cli/                      # Command-line interface
│   │   ├── __init__.py
│   │   └── main.py               # CLI entry point
│   │
│   ├── gui/                      # Desktop GUI (tkinter)
│   │   ├── __init__.py
│   │   └── app.py                # GUI application
│   │
│   └── web/                      # Web API (Flask)
│       ├── __init__.py
│       ├── api.py                # REST API endpoints
│       └── static/               # Future web frontend assets
│           ├── index.html
│           ├── css/
│           └── js/
│
├── data/                         # Data files
│   ├── top_commanders_week.csv
│   ├── top_commanders_month.csv
│   └── top_commanders_2year.csv
│
├── assets/                       # Static assets
│   └── edhreclogo.png
│
├── tests/                        # Unit tests
│   ├── __init__.py
│   ├── test_core.py
│   └── test_service.py
│
├── docs/                         # Documentation
│   ├── README.md
│   ├── API.md
│   └── DEVELOPMENT.md
│
├── dist/                         # Build outputs
│   └── (executables, packages)
│
├── build/                        # Build artifacts
│
├── scripts/                      # Utility scripts
│   ├── build_exe.bat
│   └── create_distribution.bat
│
├── requirements.txt              # Python dependencies
├── requirements-dev.txt          # Development dependencies
├── setup.py                      # Package setup
├── .gitignore
└── README.md                     # Main readme
```

## Migration Steps

1. Create new directory structure
2. Move and reorganize files
3. Update imports throughout codebase
4. Update build scripts
5. Create __init__.py files for proper package structure
6. Update documentation

## Benefits

- **Clear separation of concerns**: Core logic, service layer, and UI are separated
- **Multiple frontends**: Easy to add CLI, GUI, Web, or API
- **Testable**: Clear structure for unit tests
- **Scalable**: Easy to add new features or frontends
- **Professional**: Follows Python package best practices
