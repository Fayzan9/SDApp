from typing import Dict, Type, List, Any
from .components import (
    BaseComponent,
    WebClient,
    MobileClient,
    Server,
    LoadBalancer,
    Database,
    Cache,
    Gateway,
    MessageQueue,
    CDN,
    Firewall,
    ObjectStorage,
    LambdaFunction,
    PubSub
)

class ComponentRegistry:
    _components: Dict[str, Type[BaseComponent]] = {
        "web_client": WebClient,
        "mobile_client": MobileClient,
        "server": Server,
        "load_balancer": LoadBalancer,
        "database": Database,
        "cache": Cache,
        "api_gateway": Gateway,
        "message_queue": MessageQueue,
        "cdn": CDN,
        "firewall": Firewall,
        "blob_storage": ObjectStorage,
        "lambda_function": LambdaFunction,
        "pub_sub": PubSub,
    }

    @classmethod
    def get_component_class(cls, component_type: str) -> Type[BaseComponent]:
        return cls._components.get(component_type)

    @classmethod
    def get_all_metadata(cls) -> List[Dict[str, Any]]:
        return [comp_class.get_metadata() for comp_class in cls._components.values()]

    @classmethod
    def register_component(cls, component_type: str, component_class: Type[BaseComponent]):
        cls._components[component_type] = component_class
