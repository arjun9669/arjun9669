from pathlib import Path
import re

path = Path('README.md')
text = path.read_text(encoding='utf-8')

about = '''## 👋 About Me

<img align="right" width="340" src="./assets/ai-workflow.svg" alt="Animated production AI workflow"/>

I am an **AI Engineer based in Dubai, UAE**, currently working at **Clever Feed IT Services** on practical enterprise AI initiatives across **document intelligence, Retrieval-Augmented Generation (RAG), multilingual AI workflows, automation, AI adoption, and proof-of-concept delivery**.

My experience spans the full AI journey — from large-scale data analytics and machine learning to production-grade LLM applications, private document-grounded systems, vector search, local models, and multi-agent architectures.

- Build and evaluate **enterprise AI and document-intelligence solutions**
- Support **AI adoption and employee enablement** for real-world business teams
- Develop **OCR + RAG + vector-search** workflows for private knowledge systems
- Work with **multilingual AI** and multilingual embeddings, including **BGE-M3**
- Designed **Router, Planner, Executor and Synthesizer** agent workflows
- Built an enterprise RAG solution supporting **500+ queries per day**
- Reduced technical knowledge-retrieval time by approximately **50%**
- Improved document-query accuracy by approximately **60%**
- Worked with operational datasets containing more than **2 million records**

<br clear="right"/>
'''
text, n = re.subn(r'## 👋 About Me\n.*?(?=\n---\n\n## ⚡ Professional Impact)', about, text, count=1, flags=re.S)
if n != 1:
    raise SystemExit('About Me section not found')

expertise = '''## 🧠 Core Expertise

<div align="center">

<img src="https://img.shields.io/badge/Generative%20AI-7C3AED?style=for-the-badge&logo=openai&logoColor=white" alt="Generative AI"/>
<img src="https://img.shields.io/badge/Enterprise%20RAG-0369A1?style=for-the-badge" alt="Enterprise RAG"/>
<img src="https://img.shields.io/badge/Document%20Intelligence-0F766E?style=for-the-badge" alt="Document Intelligence"/>
<img src="https://img.shields.io/badge/Multilingual%20AI-1D4ED8?style=for-the-badge" alt="Multilingual AI"/>
<img src="https://img.shields.io/badge/Agentic%20AI-C2410C?style=for-the-badge" alt="Agentic AI"/>
<img src="https://img.shields.io/badge/Multi--Agent%20Systems-4338CA?style=for-the-badge" alt="Multi-Agent Systems"/>
<img src="https://img.shields.io/badge/OCR%20%26%20Semantic%20Search-0284C7?style=for-the-badge" alt="OCR and Semantic Search"/>
<img src="https://img.shields.io/badge/AI%20Automation-BE123C?style=for-the-badge" alt="AI Automation"/>
<img src="https://img.shields.io/badge/AI%20Enablement-047857?style=for-the-badge" alt="AI Enablement"/>
<img src="https://img.shields.io/badge/LoRA%20%26%20PEFT-6D28D9?style=for-the-badge" alt="LoRA and PEFT"/>

</div>
'''
text, n = re.subn(r'## 🧠 Core Expertise\n.*?(?=\n---\n\n## 🛠️ Technology Stack)', expertise, text, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Core Expertise section not found')

tech = '''## 🛠️ Technology Stack

### AI, LLMs & Agent Frameworks

<div align="center">

<img src="https://img.shields.io/badge/OpenAI%20API-412991?style=flat-square&logo=openai&logoColor=white" alt="OpenAI API"/>
<img src="https://img.shields.io/badge/Azure%20OpenAI-0078D4?style=flat-square&logo=microsoftazure&logoColor=white" alt="Azure OpenAI"/>
<img src="https://img.shields.io/badge/Claude%20API-D97757?style=flat-square&logo=anthropic&logoColor=white" alt="Claude API"/>
<img src="https://img.shields.io/badge/Hugging%20Face-FFD21E?style=flat-square&logo=huggingface&logoColor=111827" alt="Hugging Face"/>
<img src="https://img.shields.io/badge/LLaMA-0467DF?style=flat-square&logo=meta&logoColor=white" alt="LLaMA"/>
<img src="https://img.shields.io/badge/Ollama-000000?style=flat-square&logo=ollama&logoColor=white" alt="Ollama"/>
<img src="https://img.shields.io/badge/LangChain-1C3C3C?style=flat-square&logo=langchain&logoColor=white" alt="LangChain"/>
<img src="https://img.shields.io/badge/LlamaIndex-5B21B6?style=flat-square" alt="LlamaIndex"/>
<img src="https://img.shields.io/badge/CrewAI-E11D48?style=flat-square" alt="CrewAI"/>

</div>

### Document Intelligence, RAG & Multilingual AI

<div align="center">

<img src="https://img.shields.io/badge/OCR-0F766E?style=flat-square" alt="OCR"/>
<img src="https://img.shields.io/badge/BGE--M3-1D4ED8?style=flat-square" alt="BGE-M3"/>
<img src="https://img.shields.io/badge/Multilingual%20Embeddings-7C3AED?style=flat-square" alt="Multilingual Embeddings"/>
<img src="https://img.shields.io/badge/Hybrid%20Retrieval-0369A1?style=flat-square" alt="Hybrid Retrieval"/>
<img src="https://img.shields.io/badge/Vector%20Search-0284C7?style=flat-square" alt="Vector Search"/>
<img src="https://img.shields.io/badge/ChromaDB-E11D48?style=flat-square" alt="ChromaDB"/>
<img src="https://img.shields.io/badge/FAISS-0467DF?style=flat-square&logo=meta&logoColor=white" alt="FAISS"/>
<img src="https://img.shields.io/badge/Pinecone-111827?style=flat-square&logo=pinecone&logoColor=white" alt="Pinecone"/>
<img src="https://img.shields.io/badge/Reranking-0F766E?style=flat-square" alt="Reranking"/>

</div>

### Machine Learning, Data & Backend

<div align="center">

<img src="https://skillicons.dev/icons?i=python,fastapi,tensorflow,pytorch,mysql,postgres,docker,git,github,linux,azure,aws&perline=6" alt="Development stack"/>

<br/><br/>

<img src="https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white" alt="Pandas"/>
<img src="https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white" alt="NumPy"/>
<img src="https://img.shields.io/badge/Scikit--learn-F7931E?style=flat-square&logo=scikitlearn&logoColor=white" alt="Scikit-learn"/>
<img src="https://img.shields.io/badge/SQL-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="SQL"/>
<img src="https://img.shields.io/badge/Power%20BI-F2C811?style=flat-square&logo=powerbi&logoColor=111827" alt="Power BI"/>
<img src="https://img.shields.io/badge/Streamlit-FF4B4B?style=flat-square&logo=streamlit&logoColor=white" alt="Streamlit"/>
<img src="https://img.shields.io/badge/REST%20APIs-009688?style=flat-square&logo=fastapi&logoColor=white" alt="REST APIs"/>
<img src="https://img.shields.io/badge/ETL%20Pipelines-F59E0B?style=flat-square" alt="ETL Pipelines"/>
<img src="https://img.shields.io/badge/CI%2FCD-2088FF?style=flat-square&logo=githubactions&logoColor=white" alt="CI/CD"/>

</div>
'''
text, n = re.subn(r'## 🛠️ Technology Stack\n.*?(?=\n---\n\n# 💼 Professional Experience)', tech, text, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Technology Stack section not found')

text = text.replace('<details open>\n<summary><strong>🤖 AI Engineer — MTA Building Materials Trading, Dubai</strong></summary>', '<details>\n<summary><strong>🤖 AI Engineer — MTA Building Materials Trading, Dubai</strong></summary>', 1)

text = text.replace('''- Developed classification and regression models using Python
- Built and optimized more than **10 machine-learning models**
- Consistently achieved model accuracy above **85%**
- Engineered data pipelines processing over **1 million records**
- Prepared structured and unstructured data for ML and Generative AI workflows
- Converted business requirements into data-driven technical solutions
- Reduced manual reporting effort by approximately **30%**
- Built predictive models with more than **80% forecasting accuracy**
- Supported business planning and resource-allocation decisions''', '''- Developed and productionized **AI/ML classification and regression solutions** using Python
- Built and optimized more than **10 machine-learning models**, consistently achieving accuracy above **85%**
- Engineered scalable **AI data pipelines** processing over **1 million records**
- Prepared structured and unstructured datasets for **machine-learning and Generative AI workflows**
- Translated business requirements into practical **AI/ML engineering solutions**
- Reduced manual reporting effort by approximately **30%** through data and model-driven automation
- Built predictive models with more than **80% forecasting accuracy**
- Supported business planning and resource-allocation decisions with AI-assisted analytical outputs''', 1)

text = text.replace('''- Created ML-ready pipelines for cleaning, merging and validating data
- Processed datasets containing more than **500,000 records**
- Maintained strong data integrity for downstream ML workflows
- Conducted exploratory analysis across more than **15 datasets**
- Performed feature engineering and targeted feature selection
- Improved average model performance by approximately **12%**
- Supported classification, regression and data-preprocessing tasks''', '''- Built **AI/ML-ready data pipelines** for cleaning, merging, validation and model preparation
- Processed datasets containing more than **500,000 records**
- Maintained strong data integrity for downstream **AI and machine-learning workflows**
- Conducted exploratory analysis across more than **15 datasets** to identify model-ready patterns and features
- Performed feature engineering and targeted feature selection for supervised-learning workflows
- Improved average model performance by approximately **12%**
- Supported classification, regression, preprocessing and model-evaluation tasks across AI/ML projects''', 1)

feature = '''<td width="50%" valign="top">
<h3>🌐 Multilingual Document Intelligence & RAG</h3>

<p>Private document-grounded AI workflows designed for multilingual knowledge retrieval, document understanding and secure enterprise use.</p>

<strong>Key capabilities</strong>
<ul>
<li>OCR-based document extraction</li>
<li>Retrieval-Augmented Generation (RAG)</li>
<li>Multilingual language-model workflows</li>
<li>BGE-M3 multilingual embeddings</li>
<li>Vector search and document grounding</li>
<li>Secure deployment patterns for private knowledge systems</li>
</ul>

<p><strong>Stack:</strong><br/>
<code>Python</code> <code>OCR</code> <code>RAG</code> <code>BGE-M3</code> <code>Vector Search</code> <code>FastAPI</code></p>

<img src="https://img.shields.io/badge/Professional%20Project-Source%20Private-7C3AED?style=for-the-badge" alt="Professional project — private source"/>
</td>'''
text, n = re.subn(r'<td width="50%" valign="top">\n<h3>🌦️ Weather Prediction & AI Chatbot</h3>.*?</td>', feature, text, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Featured AI weather card not found')

snapshot = '''# 📊 GitHub Portfolio Snapshot

<div align="center">

<img width="49%" src="./assets/github-overview-card.svg" alt="Arjun Kumar GitHub portfolio overview"/>
<img width="49%" src="./assets/github-language-card.svg" alt="Arjun Kumar AI technology focus"/>

<br/><br/>

<a href="https://github.com/arjun9669?tab=repositories">
<img src="https://img.shields.io/badge/Explore%20the%20Full%20Portfolio-181717?style=for-the-badge&logo=github&logoColor=white" alt="Explore Arjun Kumar repositories"/>
</a>

</div>'''
text, n = re.subn(r'# 📈 GitHub Analytics\n.*?(?=\n---\n\n# 🌐 Languages)', snapshot, text, count=1, flags=re.S)
if n != 1:
    raise SystemExit('GitHub Analytics section not found')

path.write_text(text, encoding='utf-8')

banner = Path('assets/arjun-ai-banner.svg')
b = banner.read_text(encoding='utf-8')
b = b.replace('GENERATIVE AI • ENTERPRISE RAG • AGENTIC SYSTEMS', 'GENERATIVE AI • DOCUMENT INTELLIGENCE • ENTERPRISE RAG')
b = b.replace('LANGCHAIN • FASTAPI • VECTOR DATABASES', 'MULTILINGUAL AI • AUTOMATION • AGENTIC SYSTEMS')
b = b.replace('FROM DATA ANALYTICS TO PRODUCTION AI', 'BUILDING PRACTICAL ENTERPRISE AI PRODUCTS')
banner.write_text(b, encoding='utf-8')
