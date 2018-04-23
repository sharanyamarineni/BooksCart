from flask import Flask,render_template,flash,redirect,url_for,session,logging,request
from flask_sqlalchemy import SQLAlchemy
import os,json
from datetime import datetime
import flask_login
from flask import session as login_session
#from flask.ext.session import Session

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///static/data/bookscart.db'
db = SQLAlchemy(app)
class Book(db.Model):
    b_id = db.Column(db.String(80), primary_key=True)
    b_title = db.Column(db.String(80), nullable=False)
    b_price = db.Column(db.Float, nullable=True)
    b_orders = db.relationship('Order',backref='book',lazy=True)
class User(db.Model):
    u_order_id = db.Column(db.Integer,autoincrement=True,primary_key=True)
    #db.Sequence('u_order_id',start=1000)
    u_phone = db.Column(db.String(12))
    u_name = db.Column(db.String(80))
    u_order_date = db.Column(db.DateTime,default=datetime.now())
    u_orders = db.relationship('Order',backref='user',lazy=True)
class Order(db.Model):
    o_id = db.Column(db.Integer,db.ForeignKey('user.u_order_id'),primary_key=True)
    o_book_id = db.Column(db.String(12),db.ForeignKey('book.b_id'), primary_key=True)
    o_quantity = db.Column(db.Integer)

db.drop_all()
db.create_all()

def genBooks():
    with app.app_context(),app.test_request_context():
        with app.open_resource(app.root_path+url_for('static',filename="data/problem-solving-books.json"), mode='r') as f:
            b_JSON=json.loads(f.read())["items"]
            b_total_count=len(b_JSON)
            for i in range(b_total_count):
                curr_book=b_JSON[i]
                s=curr_book['saleInfo']
                if (s.get("listPrice",None) is not None):
                    amt=s.get("listPrice",None).get("amount",None)
                else:
                    amt=None
                #print(curr_book["id"],curr_book["volumeInfo"]["title"])
                x=Book(b_id=curr_book["id"],b_title=curr_book["volumeInfo"]["title"],b_price=((float(amt))if((amt is not None)) else None))
                db.session.add(x)
            db.session.commit()

genBooks()
for i in (Book.query.all()):
    print(i)

@app.route("/")
def homepage():
    #sess = Session()
    return render_template("homepage.html",header=True,stylesheets=["style.css"],scripts=["books.js"])

@app.route("/api/books")
def getBooks():
    with app.open_resource(app.root_path+url_for('static',filename="data/problem-solving-books.json"), mode='r') as f:
            return str(f.read())

# @app.route("/checkout/<mycart>",methods=['GET','POST'])
# def checkout(mycart):
#     if (request.method =='POST' or request.method =='GET'):
#         print("Im in possst"+mycart)
#         #session["u_cart"]=request.get_json() #request.json
#         #session["u_cart"] = request.form["u_cart"]
#         #print(session["u_cart"])
#         return  redirect(url_for("genForm"))
#     else:
#         return redirect(url_for("genForm"))

@app.route("/checkout",methods=['GET','POST'])
def checkout():
    if (request.method =='POST'):
        print("Im in possst")
        session["u_cart"]=request.get_json() #request.json
        #session["u_cart"] = request.form["u_cart"]
        print(session["u_cart"])
        return redirect(url_for("genForm"))
    else:
        return redirect(url_for("genForm"))

@app.route("/getcheckoutform")
def genForm():
    if "u_cart" in session:
        return render_template("_userform.html",cart_dict=session["u_cart"])
    return render_template("_userform.html")

#def genRandomOrderID():
@app.route("/placeorder",methods=['POST'])
def placeOrder():
    if "u_cart" in session:
        cart_dict=session["u_cart"]
        u_name=request.form["u_name"]
        u_phone=request.form["u_phone"]
        x=User(u_name=u_name,u_phone=u_phone,u_order_date=datetime.now())
        print(x)
        db.session.add(x)
        db.session.commit()
    return "Order Successfully Placed with Order ID : "

if(__name__=="__main__"):
    app.secret_key = os.urandom(24)
    login_manager = flask_login.LoginManager()
    login_manager.init_app(app)
    app.run(debug=True,use_reloader=False)
    
    
    #app.secret_key = 'super secret key'
    #app.config['SESSION_TYPE'] = 'filesystem'
    #app.run(host='0.0.0.0', port=8080)