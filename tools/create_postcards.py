"""Paint locally generated watercolor-style campus posters inside the workspace.

The locations are based on publicly available campus references. This script only
writes to assets/ in this project.
"""
from pathlib import Path
import math
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'
W,H=900,1200
SERIF='/System/Library/Fonts/Supplemental/Georgia.ttf'
ITALIC='/System/Library/Fonts/Supplemental/Georgia Italic.ttf'
BOLD='/System/Library/Fonts/Supplemental/Georgia Bold.ttf'


def polygon_wash(canvas, points, color, opacity=.7, blur=3, seed=0):
    rng=np.random.default_rng(seed)
    mask=Image.new('L',(W,H),0)
    ImageDraw.Draw(mask).polygon(points,fill=255)
    if blur: mask=mask.filter(ImageFilter.GaussianBlur(max(1,blur*.38)))
    arr=np.asarray(mask,dtype=np.float32)
    grain=rng.normal(1,.065,(H,W)).astype(np.float32)
    waves=1+.075*np.sin(np.arange(W)[None,:]*.035+np.arange(H)[:,None]*.021)
    arr=np.uint8(np.clip(arr*grain*waves*opacity,0,255))
    layer=Image.new('RGBA',(W,H),color)
    layer.putalpha(Image.fromarray(arr,'L'))
    canvas.alpha_composite(layer)


def ellipse_wash(canvas,box,color,opacity=.7,blur=5,seed=0):
    rng=np.random.default_rng(seed)
    mask=Image.new('L',(W,H),0)
    ImageDraw.Draw(mask).ellipse(box,fill=255)
    mask=mask.filter(ImageFilter.GaussianBlur(max(1,blur*.42)))
    arr=np.asarray(mask,dtype=np.float32)
    arr=np.uint8(np.clip(arr*rng.normal(1,.08,(H,W))*opacity,0,255))
    layer=Image.new('RGBA',(W,H),color)
    layer.putalpha(Image.fromarray(arr,'L'))
    canvas.alpha_composite(layer)


def line(canvas,points,fill=(92,87,75,95),width=3):
    ImageDraw.Draw(canvas,'RGBA').line(points,fill=fill,width=width,joint='curve')


def tree(canvas,x,y,scale=1,seed=1):
    rng=random.Random(seed)
    line(canvas,[(x,y),(x-8*scale,y-165*scale)],(95,99,91,130),int(7*scale))
    for i in range(11):
        cx=x+rng.randint(-65,65)*scale
        cy=y-rng.randint(148,258)*scale
        r=rng.randint(28,62)*scale
        ellipse_wash(canvas,(cx-r,cy-r,cx+r,cy+r),'#6d96a3',.32,8,seed+i)
        ellipse_wash(canvas,(cx-r*.7,cy-r*.9,cx+r*.6,cy+r*.7),'#89b1bd',.28,7,seed+i+19)


def person(canvas,x,y,scale=1,shirt='#d5aa61',seed=1):
    ellipse_wash(canvas,(x-10*scale,y-71*scale,x+10*scale,y-51*scale),'#aa8a6e',.74,2,seed)
    polygon_wash(canvas,[(x-11*scale,y-49*scale),(x+11*scale,y-49*scale),(x+15*scale,y-9*scale),(x-14*scale,y-9*scale)],shirt,.78,2,seed+1)
    line(canvas,[(x-6*scale,y-8*scale),(x-10*scale,y+28*scale)],(84,88,90,120),max(2,int(3*scale)))
    line(canvas,[(x+7*scale,y-8*scale),(x+14*scale,y+28*scale)],(84,88,90,120),max(2,int(3*scale)))


def title(canvas,city,phrase):
    d=ImageDraw.Draw(canvas,'RGBA')
    f=ImageFont.truetype(SERIF,82 if len(city)<10 else 70)
    f2=ImageFont.truetype(ITALIC,29)
    box=d.textbbox((0,0),city,font=f)
    x=(W-(box[2]-box[0]))/2
    d.text((x,93),city,font=f,fill=(44,76,92,235),stroke_width=0)
    box2=d.textbbox((0,0),phrase,font=f2)
    x2=(W-(box2[2]-box2[0]))/2
    d.text((x2,193),phrase,font=f2,fill=(169,135,72,230))
    line(canvas,[(310,246),(590,246)],(110,145,158,105),2)


def finishing(canvas,seed):
    rng=np.random.default_rng(seed)
    arr=np.asarray(canvas.convert('RGB'),dtype=np.float32)
    noise=rng.normal(0,2.6,(H,W,1))
    gran=rng.normal(0,1.9,(H//10+1,W//10+1)).astype(np.float32)
    gran=Image.fromarray(np.uint8(np.clip(gran*18+127,0,255)),'L').resize((W,H),Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(2))
    gran=(np.asarray(gran,dtype=np.float32)-127)[...,None]*.10
    arr=np.clip(arr+noise+gran,0,255).astype(np.uint8)
    result=Image.fromarray(arr,'RGB')
    paper=Image.new('RGBA',(W,H),(255,255,255,0))
    d=ImageDraw.Draw(paper,'RGBA')
    r=random.Random(seed)
    for _ in range(6000):
        x=r.randrange(W);y=r.randrange(H);size=r.choice([1,1,1,2])
        d.ellipse((x,y,x+size,y+size),fill=(70,92,94,r.randrange(3,18)))
    return Image.alpha_composite(result.convert('RGBA'),paper).convert('RGB')


def base(seed):
    canvas=Image.new('RGBA',(W,H),(247,246,235,255))
    polygon_wash(canvas,[(35,290),(865,290),(865,850),(35,850)],'#9fc5d7',.45,35,seed)
    ellipse_wash(canvas,(610,315,790,495),'#f4d783',.56,30,seed+1)
    polygon_wash(canvas,[(35,790),(865,790),(865,1100),(35,1100)],'#b5c6be',.4,30,seed+2)
    return canvas


def ahmedabad():
    c=base(10)
    # Sheth C. N. Vidyavihar: red brick corridor and trees, one coherent campus view.
    polygon_wash(c,[(95,545),(740,515),(755,923),(94,930)],'#a97e6c',.65,5,11)
    polygon_wash(c,[(72,523),(766,490),(782,550),(72,578)],'#845f57',.62,5,12)
    polygon_wash(c,[(96,580),(748,557),(754,910),(96,916)],'#c6a593',.42,2,13)
    for i in range(5):
        x=130+i*125
        ellipse_wash(c,(x,624,x+85,816),'#456477',.55,2,20+i)
        polygon_wash(c,[(x,661),(x+85,657),(x+85,840),(x,844)],'#557586',.55,2,40+i)
        line(c,[(x,843),(x,662)],(103,87,80,110),2)
    polygon_wash(c,[(35,910),(865,900),(865,1090),(35,1090)],'#a8bbc1',.50,20,50)
    tree(c,115,940,1.2,91);tree(c,790,930,1.05,92)
    person(c,420,945,.86,'#d9b461',101);person(c,490,956,.78,'#c4d0b8',102)
    line(c,[(85,918),(748,910)],(110,89,77,85),3)
    title(c,'AHMEDABAD','Where curiosity began')
    return finishing(c,100)


def anand():
    c=base(20)
    # GCET: entrance facade, circular fountain and palms documented in its brochure.
    polygon_wash(c,[(105,510),(780,510),(780,907),(105,907)],'#a6bac0',.62,5,21)
    polygon_wash(c,[(100,475),(788,485),(788,535),(100,528)],'#7596a6',.58,3,22)
    for i in range(7):
        x=135+i*90
        polygon_wash(c,[(x,600),(x+52,600),(x+52,738),(x,738)],'#5d8195',.60,2,30+i)
    polygon_wash(c,[(337,756),(553,756),(553,911),(337,911)],'#5c8495',.67,2,40)
    polygon_wash(c,[(89,815),(798,815),(798,842),(89,842)],'#e0dfc7',.69,3,43)
    ellipse_wash(c,(250,875,660,1040),'#627f91',.52,5,44)
    ellipse_wash(c,(290,889,620,995),'#8fb9bc',.68,5,45)
    ellipse_wash(c,(356,904,552,969),'#c8ddd4',.7,5,46)
    line(c,[(456,884),(456,930)],(75,116,123,130),4)
    ellipse_wash(c,(431,875,481,902),'#b5dad7',.56,5,47)
    tree(c,70,915,.85,51);tree(c,832,912,.83,52)
    person(c,176,1000,.72,'#e6ca7e',81);person(c,706,996,.73,'#7497b7',82)
    title(c,'ANAND','Learning how to build')
    return finishing(c,200)


def pune():
    c=base(30)
    # SCMHRD: Hinjewadi academic block with glass facade and hilly campus setting.
    polygon_wash(c,[(35,660),(175,540),(305,630),(445,510),(630,657),(865,565),(865,955),(35,955)],'#98b7bd',.38,18,31)
    polygon_wash(c,[(135,475),(770,505),(770,922),(135,922)],'#c4c4b8',.7,5,32)
    polygon_wash(c,[(260,512),(695,525),(695,844),(260,832)],'#759aa9',.65,3,33)
    for i in range(7):
        x=273+i*58
        line(c,[(x,519),(x,832)],(215,224,212,150),4)
    for i in range(5):
        y=567+i*55
        line(c,[(260,y),(694,y+8)],(214,222,211,140),4)
    polygon_wash(c,[(90,843),(800,855),(800,918),(90,910)],'#e3d2b7',.68,5,34)
    polygon_wash(c,[(35,946),(865,929),(865,1090),(35,1090)],'#b1c3bd',.52,20,35)
    ellipse_wash(c,(270,907,640,1044),'#87a9b4',.54,4,36)
    ellipse_wash(c,(312,921,600,990),'#c0d9d6',.66,4,37)
    tree(c,105,945,.85,61);tree(c,795,946,.82,62)
    person(c,391,1022,.77,'#d7bf86',72);person(c,475,1020,.78,'#6d90a2',73)
    title(c,'PUNE','A wider lens on the world')
    return finishing(c,300)

for name,func in [('ahmedabad-watercolor.png',ahmedabad),('anand-watercolor.png',anand),('pune-watercolor.png',pune)]:
    destination=OUT/name
    func().save(destination,optimize=True)
    print(destination)
