"""Crea un Excel editado para probar la importación: cambia M1-N1-01, rompe M1-N1-02 y añade M1-N2-99."""
import sys
from pathlib import Path
from openpyxl import load_workbook
R=Path(__file__).resolve().parent.parent
wb=load_workbook(R/"data"/"banco_problemas.xlsx"); ws=wb["Problemas"]
for r in range(2,ws.max_row+1):
    if ws[f"A{r}"].value=="M1-N1-01": ws[f"F{r}"].value="Mateo tiene 7 coches y recibe 5 más. ¿Cuántos tiene ahora?"; ws[f"G{r}"].value=7; ws[f"H{r}"].value=5
    if ws[f"A{r}"].value=="M1-N1-02": ws[f"F{r}"].value="FILA ROTA sin datos"; ws[f"G{r}"].value=None
ws.append(["M1-N2-99","Suma y resta",2,"7","Parte-todo","Nuria tiene 30 cromos y regala 12. ¿Cuántos le quedan?",30,12,None,18,"30 - 12","","h1","h2","e"])
wb.save(sys.argv[1]); print("ok")
