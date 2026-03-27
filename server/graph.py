from langgraph.graph import StateGraph, END
import sys, os
sys.path.append(os.path.dirname(__file__))
from state import ContentState
from agents.researcher import researcher_node
from agents.writer     import writer_node
from agents.editor     import editor_node
from agents.repurposer import repurposer_node

def build_graph():
    graph = StateGraph(ContentState)

    graph.add_node("researcher", researcher_node)
    graph.add_node("writer",     writer_node)
    graph.add_node("editor",     editor_node)
    graph.add_node("repurposer", repurposer_node)

    graph.set_entry_point("researcher")
    graph.add_edge("researcher", "writer")
    graph.add_edge("writer",     "editor")
    graph.add_edge("editor",     "repurposer")
    graph.add_edge("repurposer", END)

    return graph.compile()

compiled_graph = build_graph()