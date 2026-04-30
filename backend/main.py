from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import generator, api_tests, automation, bug_report, edge_cases, test_data, ai_explain

app = FastAPI(title="TestForgeAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generator.router, prefix="/api/generator")
app.include_router(api_tests.router, prefix="/api/api-tests")
app.include_router(automation.router, prefix="/api/automation")
app.include_router(bug_report.router, prefix="/api/bug-report")
app.include_router(edge_cases.router, prefix="/api/edge-cases")
app.include_router(test_data.router, prefix="/api/test-data")
app.include_router(ai_explain.router, prefix="/api/ai-explain")

@app.get("/")
def root():
    return {"message": "TestForgeAI Backend Running"}