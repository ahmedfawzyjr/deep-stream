import sys

class Solution:
    def findAnswer(self, parent: list[int], s: str) -> list[bool]:
        # Increase recursion depth for deep trees
        sys.setrecursionlimit(300000)
        
        n = len(parent)
        children = [[] for _ in range(n)]
        for i in range(1, n):
            children[parent[i]].append(i)
            
        # Ensure children are sorted in increasing order of their indices
        for i in range(n):
            children[i].sort()
            
        T = []
        L = [0] * n
        R = [0] * n
        
        def dfs(u):
            L[u] = len(T)
            for v in children[u]:
                dfs(v)
            T.append(s[u])
            R[u] = len(T) - 1
            
        dfs(0)
        
        # Now we run Manacher's algorithm on string T
        T_str = "".join(T)
        T_prime = ["#"]
        for char in T_str:
            T_prime.append(char)
            T_prime.append("#")
            
        m = len(T_prime)
        rad = [0] * m
        c = 0
        r = 0
        for i in range(m):
            mirror = 2 * c - i
            if i < r:
                rad[i] = min(r - i, rad[mirror])
            else:
                rad[i] = 1
                
            while i - rad[i] >= 0 and i + rad[i] < m and T_prime[i - rad[i]] == T_prime[i + rad[i]]:
                rad[i] += 1
                
            if i + rad[i] > r:
                c = i
                r = i + rad[i]
                
        # For each node u, the substring is T_str[L[u] : R[u] + 1]
        # In T_prime, the center of this substring is L[u] + R[u] + 1
        # The required radius is R[u] - L[u] + 2
        ans = [False] * n
        for u in range(n):
            center = L[u] + R[u] + 1
            req_rad = R[u] - L[u] + 2
            if rad[center] >= req_rad:
                ans[u] = True
                
        return ans

# Simple unit tests
if __name__ == "__main__":
    sol = Solution()
    
    # Test 1
    parent1 = [-1, 0, 0, 1, 1, 2]
    s1 = "aababa"
    ans1 = sol.findAnswer(parent1, s1)
    print("Test 1 Result:", ans1)
    assert ans1 == [True, True, False, True, True, True], f"Expected [True, True, False, True, True, True], got {ans1}"
    
    # Test 2
    parent2 = [-1, 0, 0, 0, 0]
    s2 = "aabcb"
    ans2 = sol.findAnswer(parent2, s2)
    print("Test 2 Result:", ans2)
    assert ans2 == [True, True, True, True, True], f"Expected [True, True, True, True, True], got {ans2}"
    
    print("All tests passed!")
