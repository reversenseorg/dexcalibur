.class public interface abstract Ljavax/xml/xpath/XPath;
.super Ljava/lang/Object;
.source "XPath.java"


# virtual methods
.method public abstract compile(Ljava/lang/String;)Ljavax/xml/xpath/XPathExpression;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/xml/xpath/XPathExpressionException;
        }
    .end annotation
.end method

.method public abstract evaluate(Ljava/lang/String;Ljava/lang/Object;Ljavax/xml/namespace/QName;)Ljava/lang/Object;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/xml/xpath/XPathExpressionException;
        }
    .end annotation
.end method

.method public abstract evaluate(Ljava/lang/String;Lorg/xml/sax/InputSource;Ljavax/xml/namespace/QName;)Ljava/lang/Object;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/xml/xpath/XPathExpressionException;
        }
    .end annotation
.end method

.method public abstract evaluate(Ljava/lang/String;Ljava/lang/Object;)Ljava/lang/String;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/xml/xpath/XPathExpressionException;
        }
    .end annotation
.end method

.method public abstract evaluate(Ljava/lang/String;Lorg/xml/sax/InputSource;)Ljava/lang/String;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/xml/xpath/XPathExpressionException;
        }
    .end annotation
.end method

.method public abstract getNamespaceContext()Ljavax/xml/namespace/NamespaceContext;
.end method

.method public abstract getXPathFunctionResolver()Ljavax/xml/xpath/XPathFunctionResolver;
.end method

.method public abstract getXPathVariableResolver()Ljavax/xml/xpath/XPathVariableResolver;
.end method

.method public abstract reset()V
.end method

.method public abstract setNamespaceContext(Ljavax/xml/namespace/NamespaceContext;)V
.end method

.method public abstract setXPathFunctionResolver(Ljavax/xml/xpath/XPathFunctionResolver;)V
.end method

.method public abstract setXPathVariableResolver(Ljavax/xml/xpath/XPathVariableResolver;)V
.end method
