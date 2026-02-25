#!/usr/bin/env python3
"""
AI Router Test Script
Test the intelligent routing system
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.ai_router import AIRouter, TaskType
from app.core.router import MODEL_PRIORITIES


async def test_router_initialization():
    """Test router initialization"""
    print("=" * 60)
    print("Test 1: Router Initialization")
    print("=" * 60)

    try:
        router = AIRouter()
        await router.initialize()

        print(f"✓ Router initialized successfully")
        print(f"✓ Available providers: {len(router.providers)}")
        print(f"✓ Providers: {list(router.providers.keys())}")

        # Get provider status
        status = await router.get_provider_status()
        print(f"✓ Provider status: {status}")

        return router

    except Exception as e:
        print(f"✗ Router initialization failed: {e}")
        return None


async def test_priority_configuration():
    """Test priority configuration"""
    print("\n" + "=" * 60)
    print("Test 2: Priority Configuration")
    print("=" * 60)

    print("\nPriority Configuration:")
    for task_type, providers in MODEL_PRIORITIES.items():
        print(f"\n{task_type}:")
        for i, provider in enumerate(providers, 1):
            print(f"  {i}. {provider['provider']} - {provider['model']} (priority: {provider['priority']}, cost: {provider['cost']})")


async def test_routing_simulation():
    """Test routing with simulated parameters"""
    print("\n" + "=" * 60)
    print("Test 3: Routing Simulation")
    print("=" * 60)

    router = AIRouter()
    await router.initialize()

    # Test cases
    test_cases = [
        {
            "name": "Image Generation",
            "task_type": TaskType.IMAGE_GENERATION,
            "params": {
                "prompt": "A beautiful sunset over mountains",
                "width": 1024,
                "height": 1024,
                "steps": 30,
            },
        },
        {
            "name": "Video Generation",
            "task_type": TaskType.VIDEO_GENERATION,
            "params": {
                "prompt": "A cat chasing a butterfly in a garden",
                "duration": 5.0,
                "fps": 24,
            },
        },
        {
            "name": "Music Generation",
            "task_type": TaskType.MUSIC_GENERATION,
            "params": {
                "style": "cinematic",
                "mood": "epic",
                "duration": 30.0,
            },
        },
    ]

    for test in test_cases:
        print(f"\n--- Testing: {test['name']} ---")
        try:
            result = await router.route(
                task_type=test["task_type"],
                params=test["params"],
                fallback_enabled=True,
            )
            print(f"✓ Success!")
            print(f"  Provider: {result.get('routing', {}).get('provider')}")
            print(f"  Model: {result.get('routing', {}).get('model')}")
            print(f"  Cost: {result.get('routing', {}).get('cost')}")
            print(f"  Fallback used: {result.get('routing', {}).get('fallback_used')}")
        except Exception as e:
            print(f"✗ Failed: {e}")


async def test_error_handling():
    """Test error handling and fallback"""
    print("\n" + "=" * 60)
    print("Test 4: Error Handling & Fallback")
    print("=" * 60)

    router = AIRouter()
    await router.initialize()

    # Test with invalid parameters (should trigger fallback)
    print("\n--- Testing with invalid parameters (should trigger fallback) ---")
    try:
        result = await router.route(
            task_type=TaskType.IMAGE_GENERATION,
            params={
                "prompt": "",  # Empty prompt should fail
                "width": 1024,
                "height": 1024,
            },
            fallback_enabled=True,
        )
        print(f"Result: {result}")
    except Exception as e:
        print(f"✓ Error handled correctly: {type(e).__name__}")


async def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("AI Router Test Suite")
    print("=" * 60)

    # Run tests
    router = await test_router_initialization()

    if router:
        await test_priority_configuration()
        await test_routing_simulation()
        await test_error_handling()

        # Cleanup
        await router.close()
        print("\n" + "=" * 60)
        print("All tests completed!")
        print("=" * 60)
    else:
        print("\n✗ Tests aborted due to initialization failure")


if __name__ == "__main__":
    asyncio.run(main())
