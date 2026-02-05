Q1 : que donne le code suivant : 

```python
a = "Hello"
b = "World"
mon_expression = a + b
```


Q2 : Que donne le code suivant :
```python
a = "Nombre de pommes : "
b = 4 
c = a + b
```

Q3 : que donne le code suivant : 
```python
a = "4"
b = 7
if a < b:
    print("A est plus petit ?");
else:
    print("A est plus grand ?")
```


Q4 : Comment récupérer la valeur -3
```python
a = (1, 5, -3, 9, 23)
```

Q5 : Comment faire pour que ce tuple soit égal à `("je", "suis", "petit")`
```python
a = ("je ", "suis ", "grand")
```

Q6 : Comment ajouter la valeur 15 : 
```
tab = [1, 4, 45, 78]
```

Q7 : Comment modifier ce tableau pour remplacer la valeur `6` par `"six"`
```python
tab = [1, 4, 6, 78]
```

Q8 : Écris un code permettant de parcourir ce tableau et d'afficher les valeurs qu'il contient
```python
tab = [5, 6, 9, 10, 43]
```

Q9 : **sans exécuter le code**, que donne le code suivant : 
```
l = [1, 7, 9, 15, 5, 20, 10, 8]
mon_tab = [p**2 for p in l if p < 10]
```

Q10: **Sans exécuter le code**, que donne le code suivant : 
```
m = [[1, 3, 4],     
     [2, 1, 3],
	 [5, 6, 8],
     [7, 8, 15]]
nb_colonne = 3
nb_ligne = 3
for i in range(0, nb_ligne):
    for j in range(0, nb_colonne):
        a = m[i][j]
        print(a)
```

Q11: On considère le dictionnaire suivant :
```python
mes_fruits = {"poire": 3, "pomme": 4, "orange": 2}
```

Q11.1 : Écris une fonction permettant de récupérer toutes les valeurs du dictionnaire

Q11.2 : Écris une fonction permettant de récupérer toutes les clés du dictionnaire

Q12 (Bnus expert) : à quoi sert ce code ?
```python
def fonction(tab):
	for i in range(1, len(tab)):
		val = tab[i]
		pos=i
		while pos > 0 and tab[pos-1] > val:
			tab[pos] = tab[pos-1]
			pos-=1
		tab[pos] = val
```
