.class public interface abstract Landroid/view/inputmethod/InputConnection;
.super Ljava/lang/Object;
.source "InputConnection.java"


# static fields
.field public static final CURSOR_UPDATE_IMMEDIATE:I = 0x1

.field public static final CURSOR_UPDATE_MONITOR:I = 0x2

.field public static final GET_EXTRACTED_TEXT_MONITOR:I = 0x1

.field public static final GET_TEXT_WITH_STYLES:I = 0x1


# virtual methods
.method public abstract beginBatchEdit()Z
.end method

.method public abstract clearMetaKeyStates(I)Z
.end method

.method public abstract commitCompletion(Landroid/view/inputmethod/CompletionInfo;)Z
.end method

.method public abstract commitCorrection(Landroid/view/inputmethod/CorrectionInfo;)Z
.end method

.method public abstract commitText(Ljava/lang/CharSequence;I)Z
.end method

.method public abstract deleteSurroundingText(II)Z
.end method

.method public abstract endBatchEdit()Z
.end method

.method public abstract finishComposingText()Z
.end method

.method public abstract getCursorCapsMode(I)I
.end method

.method public abstract getExtractedText(Landroid/view/inputmethod/ExtractedTextRequest;I)Landroid/view/inputmethod/ExtractedText;
.end method

.method public abstract getSelectedText(I)Ljava/lang/CharSequence;
.end method

.method public abstract getTextAfterCursor(II)Ljava/lang/CharSequence;
.end method

.method public abstract getTextBeforeCursor(II)Ljava/lang/CharSequence;
.end method

.method public abstract performContextMenuAction(I)Z
.end method

.method public abstract performEditorAction(I)Z
.end method

.method public abstract performPrivateCommand(Ljava/lang/String;Landroid/os/Bundle;)Z
.end method

.method public abstract reportFullscreenMode(Z)Z
.end method

.method public abstract requestCursorUpdates(I)Z
.end method

.method public abstract sendKeyEvent(Landroid/view/KeyEvent;)Z
.end method

.method public abstract setComposingRegion(II)Z
.end method

.method public abstract setComposingText(Ljava/lang/CharSequence;I)Z
.end method

.method public abstract setSelection(II)Z
.end method
