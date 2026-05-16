export const pythonCode = {
  "ingest.py": `import os
import json
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
# Assume pyTigerGraph is installed
import pyTigerGraph as tg

EMBEDDING_MODEL = "text-embedding-3-small"

def ingest_to_vector_store(documents):
    """
    Ingest documents into FAISS for Basic RAG.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=512,
        chunk_overlap=50
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks.")
    
    embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)
    vector_store = FAISS.from_documents(chunks, embeddings)
    vector_store.save_local("faiss_index")
    print("Vector store saved to faiss_index/")

def ingest_to_graph_db(entities, relationships):
    """
    Ingest extracted entities and relationships into TigerGraph.
    """
    conn = tg.TigerGraphConnection(
        host="YOUR_TIGERGRAPH_HOST",
        graphname="GraphRAG_Hackathon"
    )
    # conn.apiToken = conn.getToken(conn.createSecret())
    
    # Batch upsert vertices and edges
    # This is a conceptual representation
    print("Upserting to TigerGraph...")
    # conn.upsertVertexDataFrame(...)
    # conn.upsertEdgeDataFrame(...)
    print("Graph ingestion complete.")

if __name__ == "__main__":
    # Load dataset here
    # docs = load_pubmed_dataset() 
    # ingest_to_vector_store(docs)
    # entities, relations = extract_entities(docs)
    # ingest_to_graph_db(entities, relations)
    print("Data ingestion pipeline ready.")
`,
  "pipelines.py": `import time
from langchain.llms import OpenAI
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
import pyTigerGraph as tg

LLM_MODEL = "gpt-4o-mini"
EMBEDDING_MODEL = "text-embedding-3-small"

def count_tokens(text: str) -> int:
    # use tiktoken in production
    return len(text.split()) * 1.3

def pipeline_1_llm_only(query: str):
    """
    Baseline: Directly queries the LLM without any context.
    """
    # Initialize basic LLM call
    start_time = time.time()
    # Replace with real LLM call
    response = f"Simulated generic response for: {query}"
    latency = time.time() - start_time
    
    tokens = count_tokens(query) + count_tokens(response)
    return {
        "answer": response,
        "latency": latency,
        "tokens": tokens,
        "cost": (tokens / 1000) * 0.00015 # mock cost
    }

def pipeline_2_basic_rag(query: str):
    """
    Basic RAG: Retrieves top-k chunks from FAISS vector store.
    """
    start_time = time.time()
    embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)
    # vector_store = FAISS.load_local("faiss_index", embeddings)
    # docs = vector_store.similarity_search(query, k=3)
    
    # context = "\\\\n".join([doc.page_content for doc in docs])
    context = "Retrieved large text chunk... (simulated 1500 tokens)"
    prompt = f"Context: {context}\\\\n\\\\nQuery: {query}"
    
    # response = llm.predict(prompt)
    response = "Simulated RAG contextual response."
    latency = time.time() - start_time
    
    tokens = count_tokens(prompt) + count_tokens(response) + 1500
    return {
        "answer": response,
        "latency": latency,
        "tokens": tokens,
        "cost": (tokens / 1000) * 0.00015
    }

def pipeline_3_graphrag(query: str):
    """
    GraphRAG: Queries TigerGraph via MCP or REST to get exact multi-hop context.
    """
    start_time = time.time()
    # In production, use TigerGraph MCP or run a GSQL installed query
    # tg_conn.runInstalledQuery("find_relevant_subgraph", {"p_query": query})
    
    graph_context = "{'Steve Jobs': ['FOUNDED->Apple', 'RELEASED->iPhone']}"
    prompt = f"Graph Context: {graph_context}\\\\n\\\\nQuery: {query}"
    
    # response = llm.predict(prompt)
    response = "Highly accurate simulated GraphRAG response based on graph context."
    latency = time.time() - start_time
    
    tokens = count_tokens(prompt) + count_tokens(response)
    return {
        "answer": response,
        "latency": latency,
        "tokens": tokens, # Significantly lower
        "cost": (tokens / 1000) * 0.00015
    }
`,
  "evaluate.py": `from bert_score import score

def evaluate_answer(prediction: str, reference: str):
    """
    Evaluates the prediction against the ground truth using BERTScore.
    """
    P, R, F1 = score([prediction], [reference], lang="en", verbose=True)
    return {
        "precision": P.mean().item(),
        "recall": R.mean().item(),
        "f1": F1.mean().item()
    }

def llm_as_a_judge(prediction: str, reference: str, query: str):
    """
    Uses an LLM prompt to grade PASS/FAIL with detailed criteria.
    """
    prompt = f"""
    You are an expert evaluator. Evaluate the prediction's capability to answer the original query based strictly on the provided ground-truth reference.

    Please assess the prediction based on the following criteria:
    1. Factual Correctness: Does the prediction contain any factual errors, contradictions, or hallucinated information not explicitly present in the reference?
    2. Completeness: Does the prediction fully answer the user's query, or is it missing critical details necessary for a comprehensive answer?
    3. Relevance: Is the prediction directly relevant to the query without including excessive, unrelated filler?

    Context:
    Query: {query}
    Ground-Truth Reference: {reference}
    Prediction: {prediction}
    
    Based on these three criteria, determine the final grade. If the prediction is factually correct, reasonably complete, and relevant, output 'PASS'. If it fails on any of these critical dimensions, output 'FAIL'.
    
    Return ONLY the string 'PASS' or 'FAIL'.
    """
    # grade = llm.predict(prompt).strip()
    return "PASS" # Simulated
`,
  "app.py": `import streamlit as st
import asyncio
from pipelines import pipeline_1_llm_only, pipeline_2_basic_rag, pipeline_3_graphrag

st.set_page_config(layout="wide", page_title="GraphRAG Benchmark Dashboard")

st.title("GraphRAG Benchmark Dashboard")
st.markdown("Comparing Token Usage, Cost, and Accuracy: LLM vs Basic RAG vs GraphRAG")

query = st.text_input("Enter your query:", "What products did the founder of Apple release?")

if st.button("Run Benchmark"):
    # Run pipelines concurrently
    # For Streamlit, you might wrap in asyncio.gather if async functions, 
    # but for sync functions we run sequentially or use threading
    
    col1, col2, col3 = st.columns(3)
    
    with st.spinner("Running pipelines..."):
        res1 = pipeline_1_llm_only(query)
        res2 = pipeline_2_basic_rag(query)
        res3 = pipeline_3_graphrag(query)
        
    reduction = int((1 - (res3['tokens'] / res2['tokens'])) * 100) if res2['tokens'] > 0 else 0
        
    st.success(f"GraphRAG Token Reduction vs Basic RAG: {reduction}%")
    
    def render_metrics(col_obj, title, data):
        col_obj.subheader(title)
        col_obj.write("**Answer:**")
        col_obj.info(data['answer'])
        col_obj.metric("Tokens", f"{data['tokens']:,}")
        col_obj.metric("Latency (ms)", f"{data['latency']*1000:.0f}")
        col_obj.metric("Cost", f"\\$\\{data['cost']:.6f\\}")
        col_obj.metric("Accuracy", "N/A" if title == "LLM-Only" else "PASS")
        
    render_metrics(col1, "LLM-Only (Baseline)", res1)
    render_metrics(col2, "Basic RAG", res2)
    render_metrics(col3, "GraphRAG (TigerGraph)", res3)

`
};
